import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../database/PrismaService';
import { UnauthorizedError, ForbiddenError } from '../errors';

export async function communityEventManagerOnlyHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    next(new UnauthorizedError());
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { role: true },
    });

    if (!user) {
      next(new UnauthorizedError());
      return;
    }

    if (user.role !== 'admin' && user.role !== 'protector') {
      next(new ForbiddenError());
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
