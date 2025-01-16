import { response } from './response.util';
import { Response } from 'express';

describe('response', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should send a successful JSON response', () => {
        const statusCode = 200;
        const message = 'Success';
        const data = { id: 1, name: 'Test' };

        response.send({
            res: mockResponse as Response,
            statusCode,
            message,
            data,
        });

        expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            status: statusCode,
            message,
            id: 1,
            name: 'Test',
        });
    });

    it('should send a failed JSON response with error', () => {
        const statusCode = 400;
        const message = 'Error occurred';
        const error = 'Invalid input';

        response.send({
            res: mockResponse as Response,
            statusCode,
            message,
            error,
        });

        expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            status: statusCode,
            message,
            error,
        });
    });

    it('should include timestamp if specified', () => {
        const statusCode = 200;
        const message = 'Success';
        const timestamp = true;

        response.send({
            res: mockResponse as Response,
            statusCode,
            message,
            timestamp,
        });

        expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                status: statusCode,
                message,
                timestamp: expect.any(String),
            }),
        );
    });
});
