import type { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { registerSchema, signInSchema } from '../schemas/user.schema';
import { DEFAULT_USER_ADOPTER_RULES } from '@kapa/shared';
import { Jwt } from '../utils/Jwt';
import { Encrypt } from '../utils/Encypt';
import { AppError } from '../errors/AppError';

export class UserController {
  constructor(private readonly userService: UserService) {}

  public signIn = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsedBody = signInSchema.safeParse(req.body);

      if (!parsedBody.success) {
        throw AppError.badRequest(
          'Dados de login inválidos',
          parsedBody.error.format(),
        );
      }

      const { email, password } = parsedBody.data;

      let user;
      try {
        user = await this.userService.getByEmail(email);
      } catch {
        throw AppError.unauthorized('E-mail ou senha incorretos');
      }

      const userPassword = user.getPassword();

      if (!userPassword) {
        throw AppError.badRequest(
          'Esta conta foi criada com o Google. Por favor, entre usando o Google.',
        );
      }

      if (!Encrypt.verifySaltHash(password, userPassword)) {
        throw AppError.unauthorized('E-mail ou senha incorretos');
      }

      const token = Jwt.generateUserToken(user);

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: user.toDTO(),
        },
      });
    } catch (err) {
      next(err);
    }
  };

  public register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsedBody = registerSchema.safeParse(req.body);

      if (!parsedBody.success) {
        throw AppError.badRequest(
          'Dados de cadastro inválidos',
          parsedBody.error.format(),
        );
      }

      const { email, password, username, avatar, latitude, longitude } =
        parsedBody.data;

      let existingUser;
      try {
        existingUser = await this.userService.getByEmail(email);
      } catch {
        existingUser = null;
      }

      if (existingUser) {
        throw AppError.conflict(
          'Já existe um usuário cadastrado com este e-mail',
        );
      }

      const user = await this.userService.create({
        email,
        username,
        avatar: avatar ?? undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        password,
        role: 'adopter',
        rules: Array.from(DEFAULT_USER_ADOPTER_RULES),
      });

      const token = Jwt.generateUserToken(user);

      res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        data: {
          token,
          user: user.toDTO(),
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
