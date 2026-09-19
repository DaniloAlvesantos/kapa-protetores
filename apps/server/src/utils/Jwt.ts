import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'kapa-dev-secret-key-change-in-production';

export class Jwt {
  public static generateToken(data: string | object) {
    const token = jwt.sign(data, JWT_SECRET, {
      expiresIn: '7d',
      algorithm: 'HS256',
      issuer: '@kapa/api'
    });

    return token;
  }

  public static verify(token: string) {
    if (!token) {
      return [null, false];
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);

      return [payload, true];
    } catch {
      return [null, false];
    }
  }
}
