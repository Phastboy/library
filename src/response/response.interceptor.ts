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
        const statusCode = context.switchToHttp().getResponse().statusCode || HttpStatus.OK;
        return {
          success: true,
          status: statusCode,
          message: response.message ?? 'Request was successful',
          data: response.data,
        };
      }),
      catchError((err) => {
        const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
        return new Observable((subscriber) => {
          subscriber.next({
            success: false,
            status: status,
            message: err.response?.message || err.message || 'An error occurred',
            details: err.response?.error || err.stack || 'No additional details available',
          });
          subscriber.complete();
        });
      }),
    );
  }
}
