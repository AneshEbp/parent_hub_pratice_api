import { Injectable, NestInterceptor, CallHandler } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: GqlExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    console.log(
      `Received GraphQL ${info.operation.operation} '${info.fieldName}'`,
    );
    return next.handle().pipe(
      tap(() => {
        console.log(
          `GraphQL ${info.operation.operation} '${info.fieldName}' processed.`,
        );
      }),
    );
  }
}
