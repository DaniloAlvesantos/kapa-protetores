import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@kapa/shared';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { JwtService } from '../security/JwtService';
import { Jwt } from '../utils/Jwt';

export class AuthMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  public authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          error: 'Authentication token is required',
        });
      }

      const [payload, isValid] = Jwt.verify(token);

      if (!isValid) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      req.user = payload as Express.Request['user'];

      next();
    } catch (error) {
      next(error);
    }
  };

  public authorize =
    (...roles: UserRole[]) =>
    (req: Request, _res: Response, next: NextFunction): void => {
      if (!req.auth) return next(new UnauthorizedError());
      if (!roles.includes(req.auth.role)) return next(new ForbiddenError());
      next();
    };
}
