import { Router } from 'express';
import { AdopterProfileController } from '../controllers/AdopterProfileController';
import { authTokenHandler } from '../middlewares/authTokenHandler';
import { rulesHandler } from '../middlewares/rulesHandler';

export class AdopterProfileRouter {
  public readonly router: Router = Router();

  constructor(private readonly controller: AdopterProfileController) {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/count', this.controller.countAll);

    this.router.get(
      '/all',
      authTokenHandler,
      rulesHandler('admin:*'),
      this.controller.getAll,
    );

    this.router.get(
      '/me',
      authTokenHandler,
      rulesHandler('user:read:own'),
      this.controller.getMe,
    );
    this.router.put(
      '/me',
      authTokenHandler,
      rulesHandler('user:update:own'),
      this.controller.upsertMe,
    );
    this.router.patch(
      '/me',
      authTokenHandler,
      rulesHandler('user:update:own'),
      this.controller.updateMe,
    );
    this.router.delete(
      '/me',
      authTokenHandler,
      rulesHandler('user:delete:own'),
      this.controller.deleteMe,
    );

    this.router.post(
      '/preferences/search',
      authTokenHandler,
      this.controller.getByPreferences,
    );
    this.router.get(
      '/preference',
      authTokenHandler,
      this.controller.getByPreference,
    );

    this.router.post(
      '/',
      authTokenHandler,
      this.controller.create,
    );

    this.router.get(
      '/user/:id',
      authTokenHandler,
      rulesHandler('admin:*'),
      this.controller.getByUserId,
    );
    this.router.patch(
      '/user/:id',
      authTokenHandler,
      rulesHandler('admin:*'),
      this.controller.updateByUserId,
    );
    this.router.put(
      '/user/:id',
      authTokenHandler,
      rulesHandler('admin:*'),
      this.controller.upsert,
    );
    this.router.delete(
      '/user/:id',
      authTokenHandler,
      rulesHandler('admin:*'),
      this.controller.deleteByUserId,
    );

    this.router.get(
      '/:id',
      authTokenHandler,
      this.controller.getById,
    );
    this.router.patch(
      '/:id',
      authTokenHandler,
      this.controller.update,
    );
    this.router.delete(
      '/:id',
      authTokenHandler,
      rulesHandler('admin:*'),
      this.controller.delete,
    );
  }
}
