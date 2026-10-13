export type StorageProvider = 'docker' | 'supabase' | 'custom';

export interface StorageConfig {
  provider: StorageProvider;
  bucket: string;
  publicUrl: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export function getStorageConfig(env: NodeJS.ProcessEnv = process.env): StorageConfig {
  const rawProvider = env.STORAGE_PROVIDER?.trim().toLowerCase();

  if (rawProvider === 'supabase') {
    return {
      provider: 'supabase',
      bucket: env.SUPABASE_S3_BUCKET || env.S3_BUCKET || 'kapa-public',
      publicUrl:
        env.SUPABASE_S3_PUBLIC_URL ||
        env.S3_PUBLIC_URL ||
        'https://mjpwurytnjbqrvdrsivy.supabase.co/storage/v1/object/public',
      endpoint:
        env.SUPABASE_S3_ENDPOINT ||
        env.S3_ENDPOINT ||
        'https://mjpwurytnjbqrvdrsivy.storage.supabase.co/storage/v1/s3',
      region: env.SUPABASE_S3_REGION || env.S3_REGION || 'us-east-1',
      accessKeyId: env.SUPABASE_S3_ACCESS_KEY || env.S3_ACCESS_KEY || '',
      secretAccessKey: env.SUPABASE_S3_SECRET_KEY || env.S3_SECRET_KEY || '',
    };
  }

  if (rawProvider === 'custom') {
    return {
      provider: 'custom',
      bucket: env.S3_BUCKET || 'kapa-public',
      publicUrl: env.S3_PUBLIC_URL || 'http://localhost:9000',
      endpoint: env.S3_ENDPOINT || 'http://localhost:9000',
      region: env.S3_REGION || 'us-east-1',
      accessKeyId: env.S3_ACCESS_KEY || '',
      secretAccessKey: env.S3_SECRET_KEY || '',
    };
  }

  // Default: 'docker' / 'minio' / 'local'
  return {
    provider: 'docker',
    bucket: env.DOCKER_S3_BUCKET || env.S3_BUCKET || 'kapa-public',
    publicUrl: env.DOCKER_S3_PUBLIC_URL || env.S3_PUBLIC_URL || 'http://localhost:9000',
    endpoint: env.DOCKER_S3_ENDPOINT || env.S3_ENDPOINT || 'http://localhost:9000',
    region: env.DOCKER_S3_REGION || env.S3_REGION || 'us-east-1',
    accessKeyId: env.DOCKER_S3_ACCESS_KEY || env.S3_ACCESS_KEY || 'kapa',
    secretAccessKey: env.DOCKER_S3_SECRET_KEY || env.S3_SECRET_KEY || 'kapa-local-storage-secret',
  };
}
