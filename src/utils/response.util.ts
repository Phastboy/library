import { Response } from 'express';

export const response = {
  send: ({
    res,
    statusCode,
    message,
    data = null,
    error = null,
    meta = null,
    timestamp = false,
  }: {
    res: Response;
    statusCode: number;
    message: string;
    data?: object;
    error?: any;
    meta?: any;
    timestamp?: boolean;
  }) => {
    const response: any = {
      success: statusCode >= 200 && statusCode < 300,
      status: statusCode,
      message,
    };

    if (data) Object.assign(response, data);
    if (error) response.error = error;
    if (meta) response.meta = meta;
    if (timestamp) response.timestamp = new Date().toISOString();

    res.status(statusCode).json(response);
  },
};
