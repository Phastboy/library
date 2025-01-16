import { Response } from 'express';
export declare const response: {
    send: ({ res, statusCode, message, data, error, meta, timestamp, }: {
        res: Response;
        statusCode: number;
        message: string;
        data?: object;
        error?: any;
        meta?: any;
        timestamp?: boolean;
    }) => void;
};
