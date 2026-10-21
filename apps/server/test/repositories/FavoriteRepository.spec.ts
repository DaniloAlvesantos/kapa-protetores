import type { PrismaClient } from '@prisma/client';
import { FavoriteRepository } from '../../src/repositories/FavoriteRepository';

describe('FavoriteRepository', () => {
  const createMockPrisma = () => {
    const transaction = {
      animal: {
        findUnique: jest.fn(),
      },
      favorites: {
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const prisma = {
      $transaction: jest.fn(async (cb: (tx: typeof transaction) => Promise<boolean>) =>
        cb(transaction),
      ),
    } as unknown as PrismaClient;

    return { prisma, transaction };
  };

  it('throws ANIMAL_NOT_FOUND when the animal does not exist', async () => {
    const { prisma, transaction } = createMockPrisma();
    transaction.animal.findUnique.mockResolvedValue(null);

    const repo = new FavoriteRepository(prisma);
    await expect(repo.toggle('user-1', 'animal-1')).rejects.toThrow(
      'ANIMAL_NOT_FOUND',
    );
  });

  it('creates a favorite and returns true when not yet favorited', async () => {
    const { prisma, transaction } = createMockPrisma();
    transaction.animal.findUnique.mockResolvedValue({ id: 'animal-1' });
    transaction.favorites.findUnique.mockResolvedValue(null);
    transaction.favorites.create.mockResolvedValue({
      user_id: 'user-1',
      animal_id: 'animal-1',
    });

    const repo = new FavoriteRepository(prisma);
    await expect(repo.toggle('user-1', 'animal-1')).resolves.toBe(true);
    expect(transaction.favorites.create).toHaveBeenCalledWith({
      data: { user_id: 'user-1', animal_id: 'animal-1' },
    });
  });

  it('deletes the favorite and returns false when already favorited', async () => {
    const { prisma, transaction } = createMockPrisma();
    transaction.animal.findUnique.mockResolvedValue({ id: 'animal-1' });
    transaction.favorites.findUnique.mockResolvedValue({ user_id: 'user-1' });
    transaction.favorites.deleteMany.mockResolvedValue({ count: 1 });

    const repo = new FavoriteRepository(prisma);
    await expect(repo.toggle('user-1', 'animal-1')).resolves.toBe(false);
    expect(transaction.favorites.deleteMany).toHaveBeenCalledWith({
      where: { user_id: 'user-1', animal_id: 'animal-1' },
    });
  });

  it('returns true idempotently when a concurrent request causes P2002 on create', async () => {
    const { prisma, transaction } = createMockPrisma();
    transaction.animal.findUnique.mockResolvedValue({ id: 'animal-1' });
    transaction.favorites.findUnique.mockResolvedValue(null);
    transaction.favorites.create.mockRejectedValue(
      Object.assign(new Error('Unique constraint failed'), { code: 'P2002' }),
    );

    const repo = new FavoriteRepository(prisma);
    await expect(repo.toggle('user-1', 'animal-1')).resolves.toBe(true);
  });
});
