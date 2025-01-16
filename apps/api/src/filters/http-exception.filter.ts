import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { response } from '../utils/response.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'SOmething went wrong';

        const error =
            exception instanceof HttpException
                ? typeof message === 'string'
                    ? message
                    : (message as any).error
                : 'Unknown error';

        response.send({
            res,
            statusCode: status,
            message:
                typeof message === 'string'
                    ? message
                    : (message as any).message,
            error:
                status === HttpStatus.INTERNAL_SERVER_ERROR
                    ? 'Internal server error'
                    : error,
            timestamp: true,
        });
    }
}
