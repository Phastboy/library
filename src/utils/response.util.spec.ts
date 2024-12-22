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
    const success = true;

    response(mockResponse as Response, statusCode, message, data, success);

    expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success,
      message,
      data,
    });
  });

  it('should send a failed JSON response with default success as true', () => {
    const statusCode = 400;
    const message = 'Error occurred';
    const data = null;

    response(mockResponse as Response, statusCode, message, data);

    expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message,
      data,
    });
  });

  it('should override the success flag when provided', () => {
    const statusCode = 500;
    const message = 'Internal server error';
    const data = null;
    const success = false;

    response(mockResponse as Response, statusCode, message, data, success);

    expect(mockResponse.status).toHaveBeenCalledWith(statusCode);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success,
      message,
      data,
    });
  });
});
