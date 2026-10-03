import { BaseError } from './BaseError';

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found') {
    super({
      message: message,
      name: 'NotFoundError',
      statusCode: 404,
    });
  }
}
