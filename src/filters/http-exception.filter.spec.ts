import { HttpExceptionFilter } from './http-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('HttpExceptionFilter', () => {
    let filter: HttpExceptionFilter;
    let mockResponse: Partial<Response>;
    let mockHost: Partial<ArgumentsHost>;

    beforeEach(() => {
        filter = new HttpExceptionFilter();
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockHost = {
            switchToHttp: jest.fn().mockReturnValue({
                getResponse: () => mockResponse,
            }),
        };
    });

    it('should handle HttpException correctly', () => {
        const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

        filter.catch(exception, mockHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            status: HttpStatus.FORBIDDEN,
            message: 'Forbidden',
            error: 'Forbidden',
            timestamp: expect.any(String),
        });
    });

    it('should handle unknown exceptions correctly', () => {
        const exception = new Error('Unknown error');

        filter.catch(exception, mockHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'SOmething went wrong',
            error: 'Internal server error',
            timestamp: expect.any(String),
        });
    });

    it('should handle HttpException with object response correctly', () => {
        const exception = new HttpException(
            { message: 'Validation failed', error: 'Bad Request' },
            HttpStatus.BAD_REQUEST,
        );

        filter.catch(exception, mockHost as ArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(
            HttpStatus.BAD_REQUEST,
        );
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            status: HttpStatus.BAD_REQUEST,
            message: 'Validation failed',
            error: 'Bad Request',
            timestamp: expect.any(String),
        });
    });
});
