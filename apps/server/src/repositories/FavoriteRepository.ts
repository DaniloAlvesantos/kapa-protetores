import { PrismaClient } from '@prisma/client';

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

export class FavoriteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async toggle(userId: string, animalId: string): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      const animal = await transaction.animal.findUnique({
        where: { id: animalId },
        select: { id: true },
      });
      if (!animal) throw new Error('ANIMAL_NOT_FOUND');

      const where = {
        user_id_animal_id: { user_id: userId, animal_id: animalId },
      };
      const favorite = await transaction.favorites.findUnique({
        where,
        select: { user_id: true },
      });
      if (favorite) {
        await transaction.favorites.deleteMany({
          where: { user_id: userId, animal_id: animalId },
        });
        return false;
      }

      try {
        await transaction.favorites.create({
          data: { user_id: userId, animal_id: animalId },
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          return true;
        }
        throw error;
      }

      return true;
    });
  }
}
