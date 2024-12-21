import { Response } from 'express';

export const response = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
  success: boolean = true,
): Response => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};
