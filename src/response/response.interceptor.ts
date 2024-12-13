import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
          message: response.message ?? `Successfully processed ${method} request to ${url}`,
          data: response.data ?? response,
        };
      }),
    );
  }
}
