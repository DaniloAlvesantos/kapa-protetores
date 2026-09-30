import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import type { ApiErrorResponse } from '@kapa/shared';

export class ErrorHandler {
  public static handle(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void {
    if (err instanceof AppError) {
      const response: ApiErrorResponse = {
        success: false,
        error: err.message,
        details: err.details,
      };
      res.status(err.statusCode).json(response);
      return;
    }

    console.error('[ServerError]:', err);
    const response: ApiErrorResponse & { message?: string } = {
      success: false,
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    };
    res.status(500).json(response);
  }
}
