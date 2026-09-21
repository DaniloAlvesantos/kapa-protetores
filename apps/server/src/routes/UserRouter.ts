import { Router } from 'express';
import { UserController } from '../controllers/UserController';

export class UserRouter {
  public readonly router: Router = Router();

  constructor(private readonly controller: UserController) {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/create', this.controller.register);
    this.router.post('/signin', this.controller.signIn);
  }
}
