import { kapaService } from '@/services/kapaService';
import type { Animal, ApiResponse } from '@kapa/shared';
import { useQuery } from '@tanstack/react-query';

async function getAnimal(id: string): Promise<Animal> {
  const response = await kapaService.get<ApiResponse<Animal>>(`/animals/${id}`);
  if (!response.data?.data) {
    throw new Error('Animal não encontrado.');
  }
  return response.data.data;
}

export const useAnimal = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id),
    enabled: !!id,
  });

  return {
    animal: data,
    isLoading,
    error,
  };
};
