import crypto from 'node:crypto';

type HashAlgorithms = 'sha1';
type OutPutEncoding = 'base64' | 'base64url' | 'hex' | 'binary';

const SALT_SECRET = process.env.SALT_SECRET! as string;

export class Encrypt {
  public static hash(
    algorith: HashAlgorithms,
    data: string,
    outputEncoding?: OutPutEncoding,
  ) {
    return crypto.hash(algorith, data, outputEncoding);
  }

  public static saltHash(data: string) {
    return crypto.pbkdf2Sync(data, SALT_SECRET, 100000, 64, 'sha512');
  }

  public static verifySaltHash(data: string, hashed: string) {
    const verifyHash = this.saltHash(data).toString('hex');

    return verifyHash === hashed;
  }

  public static symetric() {}
  public static assymetric() {}
}
