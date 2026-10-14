import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@kapa/shared';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { JwtService } from '../security/JwtService';

export class AuthMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  public authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    try {
      const authorization = req.header('authorization');
      const [scheme, token] = authorization?.split(' ') ?? [];
      if (scheme !== 'Bearer' || !token) throw new UnauthorizedError();
      const payload = this.jwtService.verify(token);
      req.user = {
        sub: payload.sub,
        role: payload.role,
        rules: payload.rules ?? [],
        username: payload.username ?? '',
        email: payload.email,
      };
      next();
    } catch (error) {
      next(error);
    }
  };

  public authorize =
    (...roles: UserRole[]) =>
    (req: Request, _res: Response, next: NextFunction): void => {
      if (!req.user) return next(new UnauthorizedError());
      if (!roles.includes(req.user.role)) return next(new ForbiddenError());
      next();
    };
}
