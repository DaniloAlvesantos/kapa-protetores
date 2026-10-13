import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export class AuthRouter {
  public readonly router: Router = Router();

  constructor(private readonly controller: AuthController) {
    this.router.post('/google', this.controller.googleSignIn);
  }
}
