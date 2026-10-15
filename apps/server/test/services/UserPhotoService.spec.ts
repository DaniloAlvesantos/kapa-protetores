import { UserPhotoService } from '../../src/services/UserPhotoService';
import { PrismaClient } from '@prisma/client';

describe('UserPhotoService', () => {
  const mockSend = jest.fn().mockResolvedValue({});

  jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
  }));

  it('uploads valid image and stores URL containing the bucket name', async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-123' }),
        update: jest.fn().mockResolvedValue({ id: 'user-123', avatar: '' }),
      },
    } as unknown as PrismaClient;

    const service = new UserPhotoService(
      mockPrisma,
      'kapa-public',
      'http://localhost:9000',
      'http://localhost:9000',
      'us-east-1',
      'test-key',
      'test-secret',
    );

    (service as unknown as { client: { send: jest.Mock } }).client = {
      send: jest.fn().mockResolvedValue({}),
    };

    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const mockFile = {
      buffer: jpegBuffer,
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    const result = await service.upload('user-123', mockFile);

    expect(result.avatarUrl).toMatch(
      /^http:\/\/localhost:9000\/kapa-public\/avatars\/user-123\/[a-f0-9-]+\.jpg$/,
    );
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { avatar: result.avatarUrl },
    });
  });

  it('does not duplicate bucket name if publicUrl already ends with bucket', async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-123' }),
        update: jest.fn().mockResolvedValue({ id: 'user-123', avatar: '' }),
      },
    } as unknown as PrismaClient;

    const service = new UserPhotoService(
      mockPrisma,
      'kapa-public',
      'http://localhost:9000/kapa-public',
      'http://localhost:9000',
      'us-east-1',
      'test-key',
      'test-secret',
    );

    (service as unknown as { client: { send: jest.Mock } }).client = {
      send: jest.fn().mockResolvedValue({}),
    };

    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const mockFile = {
      buffer: jpegBuffer,
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    const result = await service.upload('user-123', mockFile);

    expect(result.avatarUrl).toMatch(
      /^http:\/\/localhost:9000\/kapa-public\/avatars\/user-123\/[a-f0-9-]+\.jpg$/,
    );
    expect(result.avatarUrl).not.toContain('kapa-public/kapa-public');
  });

  it('throws 404 when user is not found', async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaClient;

    const service = new UserPhotoService(
      mockPrisma,
      'kapa-public',
      'http://localhost:9000',
      'http://localhost:9000',
      'us-east-1',
      'key',
      'secret',
    );

    const emptyFile = {
      buffer: Buffer.from([]),
      mimetype: 'application/octet-stream',
    } as Express.Multer.File;

    await expect(
      service.upload('unknown-user', emptyFile),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 400 when file content is not a valid image', async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-123' }),
      },
    } as unknown as PrismaClient;

    const service = new UserPhotoService(
      mockPrisma,
      'kapa-public',
      'http://localhost:9000',
      'http://localhost:9000',
      'us-east-1',
      'key',
      'secret',
    );

    const invalidFile = {
      buffer: Buffer.from('not an image'),
      mimetype: 'text/plain',
    } as Express.Multer.File;

    await expect(
      service.upload('user-123', invalidFile),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
