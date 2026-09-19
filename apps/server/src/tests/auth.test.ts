import { describe, it } from 'node:test';
import assert from 'node:assert';
import { googleAuthSchema } from '../schemas/auth.schema';
import { Jwt } from '../utils/Jwt';
import { authTokenHandler } from '../middlewares/authTokenHandler';
import { Request, Response } from 'express';
import { UserJwt } from '@kapa/shared';

describe('Google Auth Schema Validation', () => {
  it('should reject missing idToken', () => {
    const result = googleAuthSchema.safeParse({});
    assert.strictEqual(result.success, false);
  });

  it('should reject empty idToken string', () => {
    const result = googleAuthSchema.safeParse({ idToken: '' });
    assert.strictEqual(result.success, false);
  });

  it('should accept valid idToken', () => {
    const result = googleAuthSchema.safeParse({ idToken: 'valid-google-id-token' });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.idToken, 'valid-google-id-token');
    }
  });
});

describe('Jwt Utility', () => {
  it('should generate and verify valid token', () => {
    const payload: UserJwt = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'user@example.com',
      username: 'Test User',
      role: 'adopter',
      rules: ['adopter:read'],
    };

    const token = Jwt.generateToken(payload);
    assert.ok(typeof token === 'string' && token.length > 0);

    const [decoded, isValid] = Jwt.verify(token);
    assert.strictEqual(isValid, true);
    assert.ok(decoded && typeof decoded === 'object');
    assert.strictEqual((decoded as UserJwt).sub, payload.sub);
    assert.strictEqual((decoded as UserJwt).email, payload.email);
    assert.strictEqual((decoded as UserJwt).role, payload.role);
  });

  it('should reject invalid or tampered token', () => {
    const [, isValid] = Jwt.verify('invalid.token.here');
    assert.strictEqual(isValid, false);
  });

  it('should reject empty token', () => {
    const [, isValid] = Jwt.verify('');
    assert.strictEqual(isValid, false);
  });
});

describe('authTokenHandler Middleware', () => {
  it('should return 401 when Authorization header is missing', () => {
    const req = { headers: {} } as unknown as Request;
    let statusCode: number | undefined;
    let responseBody: unknown;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: unknown) {
        responseBody = body;
        return this;
      },
    } as unknown as Response;

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authTokenHandler(req, res, next);
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.deepStrictEqual(responseBody, {
      error: 'Authentication token is required',
    });
  });

  it('should return 403 when token is invalid', () => {
    const req = {
      headers: { authorization: 'Bearer invalid-token' },
    } as unknown as Request;

    let statusCode: number | undefined;
    let responseBody: unknown;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: unknown) {
        responseBody = body;
        return this;
      },
    } as unknown as Response;

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authTokenHandler(req, res, next);
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(nextCalled, false);
    assert.deepStrictEqual(responseBody, {
      error: 'Invalid or expired token',
    });
  });

  it('should call next and attach user when token is valid', () => {
    const userJwt: UserJwt = {
      sub: 'user-uuid-1',
      email: 'valid@example.com',
      username: 'Valid User',
      role: 'adopter',
      rules: ['adopter:read'],
    };

    const token = Jwt.generateToken(userJwt);
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as Request;

    const res = {} as unknown as Response;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authTokenHandler(req, res, next);
    assert.strictEqual(nextCalled, true);
    assert.ok(req.user);
    assert.strictEqual(req.user.sub, userJwt.sub);
    assert.strictEqual(req.user.email, userJwt.email);
  });
});

describe('AuthController', () => {
  it('should forward badRequest error when idToken is missing', async () => {
    const mockUserService = {} as unknown as import('../services/UserService').UserService;
    const { AuthController } = await import('../controllers/AuthController');
    const controller = new AuthController(mockUserService);

    const req = { body: {} } as unknown as Request;
    const res = {} as unknown as Response;
    let forwardedError: unknown;
    const next = (err?: unknown) => { forwardedError = err; };

    await controller.googleSignIn(req, res, next);
    assert.ok(forwardedError instanceof Error);
  });

  it('should authenticate and return 200 with token and user', async () => {
    const { User } = await import('../models/User');
    const mockUser = new User();
    mockUser.setId('123e4567-e89b-12d3-a456-426614174000');
    mockUser.setUsername('Google User');
    mockUser.setEmail('google@example.com');
    mockUser.setRole('adopter');
    mockUser.setCreatedAt(new Date().toISOString());

    const mockUserService = {
      authenticateWithGoogle: async () => mockUser,
    } as unknown as import('../services/UserService').UserService;

    const { AuthController } = await import('../controllers/AuthController');
    const controller = new AuthController(mockUserService);

    const req = { body: { idToken: 'valid-google-id-token' } } as unknown as Request;
    let statusCode: number | undefined;
    let responseData: unknown;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: unknown) {
        responseData = body;
        return this;
      },
    } as unknown as Response;

    const next = () => {};

    await controller.googleSignIn(req, res, next);
    assert.strictEqual(statusCode, 200);
    assert.ok(responseData && typeof responseData === 'object');
    const typedRes = responseData as { success: boolean; data: { token: string; user: { email: string } } };
    assert.strictEqual(typedRes.success, true);
    assert.ok(typedRes.data.token);
    assert.strictEqual(typedRes.data.user.email, 'google@example.com');
  });
});

