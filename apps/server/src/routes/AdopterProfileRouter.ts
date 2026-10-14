import { Router } from 'express';
import { AdopterProfileController } from '../controllers/AdopterProfileController';
import { rulesHandler } from '../middlewares/rulesHandler';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

export class AdopterProfileRouter {
  public readonly router: Router = Router();

  constructor(private readonly controller: AdopterProfileController, private readonly auth: AuthMiddleware) {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/count', this.controller.countAll);

    this.router.get(
      '/all',
      this.auth.authenticate,
      rulesHandler('admin:*'),
      this.controller.getAll,
    );

    this.router.get(
      '/me',
      this.auth.authenticate,
      rulesHandler('user:read:own'),
      this.controller.getMe,
    );
    this.router.put(
      '/me',
      this.auth.authenticate,
      rulesHandler('user:update:own'),
      this.controller.upsertMe,
    );
    this.router.patch(
      '/me',
      this.auth.authenticate,
      rulesHandler('user:update:own'),
      this.controller.updateMe,
    );
    this.router.delete(
      '/me',
      this.auth.authenticate,
      rulesHandler('user:delete:own'),
      this.controller.deleteMe,
    );

    this.router.post(
      '/preferences/search',
      this.auth.authenticate,
      this.controller.getByPreferences,
    );
    this.router.get(
      '/preference',
      this.auth.authenticate,
      this.controller.getByPreference,
    );

    this.router.post(
      '/',
      this.auth.authenticate,
      this.controller.create,
    );

    this.router.get(
      '/user/:id',
      this.auth.authenticate,
      rulesHandler('admin:*'),
      this.controller.getByUserId,
    );
    this.router.patch(
      '/user/:id',
      this.auth.authenticate,
      rulesHandler('admin:*'),
      this.controller.updateByUserId,
    );
    this.router.put(
      '/user/:id',
      this.auth.authenticate,
      rulesHandler('admin:*'),
      this.controller.upsert,
    );
    this.router.delete(
      '/user/:id',
      this.auth.authenticate,
      rulesHandler('admin:*'),
      this.controller.deleteByUserId,
    );

    this.router.get(
      '/:id',
      this.auth.authenticate,
      this.controller.getById,
    );
    this.router.patch(
      '/:id',
      this.auth.authenticate,
      this.controller.update,
    );
    this.router.delete(
      '/:id',
      this.auth.authenticate,
      rulesHandler('admin:*'),
      this.controller.delete,
    );
  }
}
