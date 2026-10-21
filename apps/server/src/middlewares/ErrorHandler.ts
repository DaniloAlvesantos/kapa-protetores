import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/BaseError';
import multer from 'multer';
import { InternalServerError, BadRequestError, NotFoundError } from '../errors';
import { logger } from '../config/logger';

export class ErrorHandler {
  public static handle(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    const context = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      userId: req.user?.sub,
    };

    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'A foto deve ter no máximo 5 MB.'
          : 'Não foi possível processar a foto enviada.';

      logger.warn({ ...context, code: err.code }, message);
      return new BadRequestError(message).sendResponse(res);
    }

    if (err instanceof BaseError && err.statusCode < 500) {
      logger.warn(
        { ...context, statusCode: err.statusCode, errorName: err.name },
        err.message,
      );
      return err.sendResponse(res);
    }

    if (err instanceof NotFoundError) {
      logger.warn(
        { ...context, statusCode: err.statusCode, errorName: err.name },
        err.message,
      );
      return err.sendResponse(res);
    }

    logger.error({ ...context, err }, 'Unhandled server error');
    return new InternalServerError().sendResponse(res);
  }
}
