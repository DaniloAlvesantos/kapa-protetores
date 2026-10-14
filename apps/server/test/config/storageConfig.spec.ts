import { getStorageConfig } from '../../src/config/storageConfig';

describe('storageConfig', () => {
  it('defaults to docker MinIO provider when STORAGE_PROVIDER is unset', () => {
    const config = getStorageConfig({});
    expect(config.provider).toBe('docker');
    expect(config.endpoint).toBe('http://localhost:9000');
    expect(config.publicUrl).toBe('http://localhost:9000');
    expect(config.bucket).toBe('kapa-public');
    expect(config.accessKeyId).toBe('kapa');
    expect(config.secretAccessKey).toBe('kapa-local-storage-secret');
    expect(config.region).toBe('us-east-1');
  });

  it('loads supabase provider configuration when STORAGE_PROVIDER is supabase', () => {
    const config = getStorageConfig({
      STORAGE_PROVIDER: 'supabase',
      SUPABASE_S3_ACCESS_KEY: 'test-supabase-key',
      SUPABASE_S3_SECRET_KEY: 'test-supabase-secret',
      SUPABASE_S3_BUCKET: 'custom-supabase-bucket',
    });

    expect(config.provider).toBe('supabase');
    expect(config.endpoint).toBe('https://mjpwurytnjbqrvdrsivy.storage.supabase.co/storage/v1/s3');
    expect(config.publicUrl).toBe('https://mjpwurytnjbqrvdrsivy.supabase.co/storage/v1/object/public');
    expect(config.bucket).toBe('custom-supabase-bucket');
    expect(config.accessKeyId).toBe('test-supabase-key');
    expect(config.secretAccessKey).toBe('test-supabase-secret');
    expect(config.region).toBe('us-east-1');
  });

  it('allows overriding supabase endpoints and public URLs if specified', () => {
    const config = getStorageConfig({
      STORAGE_PROVIDER: 'supabase',
      SUPABASE_S3_ENDPOINT: 'https://custom-project.storage.supabase.co/storage/v1/s3',
      SUPABASE_S3_PUBLIC_URL: 'https://custom-project.supabase.co/storage/v1/object/public',
      SUPABASE_S3_ACCESS_KEY: 'sub-key',
      SUPABASE_S3_SECRET_KEY: 'sub-secret',
    });

    expect(config.endpoint).toBe('https://custom-project.storage.supabase.co/storage/v1/s3');
    expect(config.publicUrl).toBe('https://custom-project.supabase.co/storage/v1/object/public');
  });

  it('loads docker provider configuration when STORAGE_PROVIDER is docker', () => {
    const config = getStorageConfig({
      STORAGE_PROVIDER: 'docker',
      DOCKER_S3_ENDPOINT: 'http://custom-minio:9000',
    });

    expect(config.provider).toBe('docker');
    expect(config.endpoint).toBe('http://custom-minio:9000');
    expect(config.bucket).toBe('kapa-public');
  });

  it('supports custom S3 provider for deploy/cloud', () => {
    const config = getStorageConfig({
      STORAGE_PROVIDER: 'custom',
      S3_BUCKET: 'production-bucket',
      S3_ENDPOINT: 'https://s3.us-east-1.amazonaws.com',
      S3_PUBLIC_URL: 'https://cdn.example.com',
      S3_ACCESS_KEY: 'custom-key',
      S3_SECRET_KEY: 'custom-secret',
    });

    expect(config.provider).toBe('custom');
    expect(config.bucket).toBe('production-bucket');
    expect(config.endpoint).toBe('https://s3.us-east-1.amazonaws.com');
    expect(config.publicUrl).toBe('https://cdn.example.com');
  });
});
