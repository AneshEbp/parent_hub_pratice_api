import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';

/**
 * Security interceptor for monitoring and logging security-relevant operations
 */
@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = this.getRequest(context);
    const response = this.getResponse(context);

    // Add security headers to response
    this.addSecurityHeaders(response);

    // Log security-relevant operations
    this.logSecurityEvent(context, request);

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logSuccessfulOperation(context, request, duration);
      }),
      catchError((error) => {
        this.logSecurityError(context, request, error);
        throw error;
      }),
    );
  }

  private getRequest(context: ExecutionContext): Request {
    const type = context.getType<'http' | 'rpc' | 'graphql' | 'ws'>();

    if (type === 'http') {
      return context.switchToHttp().getRequest();
    } else if (type === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().req;
    }

    throw new Error(`Unsupported context type: ${type}`);
  }

  private getResponse(context: ExecutionContext): Response {
    const type = context.getType<'http' | 'rpc' | 'graphql' | 'ws'>();

    if (type === 'http') {
      return context.switchToHttp().getResponse();
    } else if (type === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().res;
    }

    throw new Error(`Unsupported context type: ${type}`);
  }

  private addSecurityHeaders(response: Response): void {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }

  private logSecurityEvent(context: ExecutionContext, request: Request): void {
    const path = request.path;
    const method = request.method;
    const ip = request.ip;
    const userAgent = request.get('User-Agent');

    // Log high-risk operations
    if (this.isHighRiskOperation(path, method)) {
      this.logger.warn(
        `[SECURITY] High-risk operation: ${method} ${path} - IP: ${ip} - User-Agent: ${userAgent}`,
      );
    }

    // Log authentication-related operations
    if (path.includes('auth') || path.includes('login') || path.includes('register')) {
      this.logger.log(`[AUTH] ${method} ${path} - IP: ${ip}`);
    }

    // Log admin operations
    if (path.includes('admin') || path.includes('cms')) {
      this.logger.log(`[ADMIN] ${method} ${path} - IP: ${ip}`);
    }
  }

  private logSuccessfulOperation(
    context: ExecutionContext,
    request: Request,
    duration: number,
  ): void {
    const path = request.path;
    const method = request.method;

    // Log slow operations
    if (duration > 5000) {
      // 5 seconds
      this.logger.warn(`[PERFORMANCE] Slow operation: ${method} ${path} - Duration: ${duration}ms`);
    }
  }

  private logSecurityError(context: ExecutionContext, request: Request, error: any): void {
    const path = request.path;
    const method = request.method;
    const ip = request.ip;

    this.logger.error(`[SECURITY-ERROR] ${method} ${path} - IP: ${ip} - Error: ${error.message}`);
  }

  private isHighRiskOperation(path: string, method: string): boolean {
    const highRiskPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/reset-password',
      '/admin',
      '/cms',
      '/webhook',
      '/upload',
      '/delete',
    ];

    const highRiskMethods = ['DELETE', 'PUT', 'PATCH'];

    return (
      highRiskPaths.some((riskPath) => path.includes(riskPath)) || highRiskMethods.includes(method)
    );
  }
}
