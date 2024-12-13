import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const statusCode = httpContext.getResponse().statusCode || HttpStatus.OK;
        const method = request.method;
        const url = request.url;
        return {
          success: true,
          status: statusCode,
          message: `Successfully processed ${method} request to ${url}`,
          data: response,
        };
      }),
      catchError((err) => {
        const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
        return new Observable((subscriber) => {
          subscriber.next({
            success: false,
            status: status,
            message: err.response?.message ?? err.message ?? err ?? 'An error occurred',
          });
          subscriber.complete();
        });
      }),
    );
  }
}
