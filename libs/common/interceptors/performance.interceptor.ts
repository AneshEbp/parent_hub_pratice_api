import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  args?: any;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo();
    const args = gqlCtx.getArgs();

    const operation = `${info.parentType.name}.${info.fieldName}`;

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        this.recordMetric({
          operation,
          duration,
          timestamp: new Date(),
          success: true,
          args: this.sanitizeArgs(args),
        });

        // Log slow operations
        if (duration > 1000) {
          console.warn(`🐌 Slow operation detected: ${operation} took ${duration}ms`);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.recordMetric({
          operation,
          duration,
          timestamp: new Date(),
          success: false,
          error: error.message,
          args: this.sanitizeArgs(args),
        });

        console.error(`❌ Operation failed: ${operation} after ${duration}ms`, error.message);
        throw error;
      }),
    );
  }

  private recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private sanitizeArgs(args: any): any {
    // Remove sensitive data from args for logging
    const sanitized = { ...args };
    if (sanitized.input) {
      const input = { ...sanitized.input };
      // Remove sensitive fields
      delete input.password;
      delete input.token;
      delete input.secret;
      sanitized.input = input;
    }
    return sanitized;
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(operation?: string): number {
    const filtered = operation
      ? this.metrics.filter((m) => m.operation === operation)
      : this.metrics;

    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, metric) => sum + metric.duration, 0);
    return total / filtered.length;
  }

  getSlowOperations(threshold: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter((m) => m.duration > threshold);
  }

  getErrorRate(operation?: string): number {
    const filtered = operation
      ? this.metrics.filter((m) => m.operation === operation)
      : this.metrics;

    if (filtered.length === 0) return 0;

    const errors = filtered.filter((m) => !m.success).length;
    return (errors / filtered.length) * 100;
  }

  getOperationStats(operation: string) {
    const operationMetrics = this.metrics.filter((m) => m.operation === operation);

    if (operationMetrics.length === 0) {
      return {
        count: 0,
        averageTime: 0,
        minTime: 0,
        maxTime: 0,
        errorRate: 0,
      };
    }

    const times = operationMetrics.map((m) => m.duration);
    const errors = operationMetrics.filter((m) => !m.success).length;

    return {
      count: operationMetrics.length,
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      errorRate: (errors / operationMetrics.length) * 100,
    };
  }

  clearMetrics() {
    this.metrics = [];
  }
}
