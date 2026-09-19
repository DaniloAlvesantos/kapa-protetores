import { CreateUserInput, UserRole } from '@kapa/shared';
import { OAuth2Client } from 'google-auth-library';
import { AppError, ServiceError } from '../errors';
import { User } from '../models';
import { UserRepository } from '../repositories/UserRepository';
import { Email } from '../domains/Email';
import { UUID } from '../domains/UUID';
import { Url } from '../domains/Url';
import { DEFAULT_USER_ADOPTER_RULES } from '@kapa/shared';
import { Encrypt } from '../utils/Encypt';

const googleClient = new OAuth2Client();

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  public async authenticateWithGoogle(idToken: string) {
    const audiences = [
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_WEB_CLIENT_ID,
      process.env.GOOGLE_IOS_CLIENT_ID,
      process.env.GOOGLE_ANDROID_CLIENT_ID,
    ].filter((id): id is string => Boolean(id));

    let ticket;

    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: audiences.length > 0 ? audiences : undefined,
      });
    } catch {
      throw AppError.unauthorized('Token do Google inválido ou expirado');
    }

    const payload = ticket.getPayload();

    if (!payload || !payload.email || !payload.email_verified) {
      throw AppError.unauthorized('Email do Google não verificado');
    }

    const { name, email, picture } = payload;

    if (!email) {
      throw new ServiceError('Email não encontrado no payload do Google.');
    }

    const safeEmail = Email.create(email);
    let user = await this.repository.findByEmail(safeEmail);

    if (user) {
      return user;
    }

    const username = name || email.split('@')[0];

    user = await this.create({
      username,
      email,
      avatar: picture ?? undefined,
      role: 'adopter',
      rules: Array.from(DEFAULT_USER_ADOPTER_RULES),
    });

    return user;
  }

  public async getAll() {
    return this.repository.findAll();
  }

  public async getById(id: string) {
    const safeId = UUID.create(id);

    const user = await this.repository.findById(safeId);

    if (!user) {
      throw AppError.notFound(`User with ID: ${id} not found`);
    }

    return user;
  }

  public async getByEmail(email: string) {
    const safeEmail = Email.create(email);

    const user = await this.repository.findByEmail(safeEmail);

    if (!user) {
      throw AppError.notFound(`User not found by email: ${email}`);
    }

    return user;
  }

  public async getAllByRole(role: UserRole) {
    return this.repository.findAllByRole(role);
  }

  public async getAllByRules(rules: string[]) {
    return this.repository.findAllByHasRules(rules);
  }

  public async getAllByUsername(username: string) {
    return this.repository.findAllByHasUsername(username);
  }

  public async getAllByCreatedAt(createdAt: Date) {
    return this.repository.findAllByCreatedAt(createdAt);
  }

  public async create(input: CreateUserInput) {
    if (!input || typeof input !== 'object') {
      throw AppError.badRequest('User data invalid.');
    }

    if (!input.email) {
      throw AppError.badRequest('Email is required.');
    }

    if (!input.username) {
      throw AppError.badRequest('Username is required.');
    }

    const hasedPassword = input.password
      ? Encrypt.saltHash(input.password).toString('hex')
      : undefined;

    const user = new User();
    user.setUsername(input.username);
    user.setEmail(input.email);
    user.setAvatar(input.avatar);
    user.setPassword(hasedPassword);
    if (input.role) user.setRole(input.role satisfies UserRole);
    if (input.rules) user.setRules(input.rules);
    user.setLatitude(input.latitude);
    user.setLongitude(input.longitude);

    return this.repository.create(user);
  }

  public async updateAvatar(id: string, url: string) {
    const safeId = UUID.create(id);
    const safeUrl = Url.create(url);
    const user = await this.repository.updateAvatar(safeId, safeUrl);

    if (!user) {
      throw AppError.notFound(`User Could not updated.`);
    }

    return user;
  }

  public async updatePassword(id: string, newPassword: string) {
    const safeId = UUID.create(id);

    let user = await this.repository.findById(safeId);

    if (!user) {
      throw AppError.notFound('User not found with id: ' + safeId);
    }

    const hashedPassord = Encrypt.saltHash(newPassword).toString('hex');
    const currentPassword = user.getPassword();

    // if the passwords are the same, return the user
    if (
      currentPassword &&
      Encrypt.verifySaltHash(currentPassword, hashedPassord)
    ) {
      return user;
    }

    user = await this.repository.updatePassword(safeId, hashedPassord);

    if (!user) {
      throw AppError.internal('Error on updating user password.');
    }

    return user;
  }
}
