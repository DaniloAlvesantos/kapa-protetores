import { isAxiosError } from 'axios';
import { kapaService } from '@/services/kapaService';
import type { Animal, ApiResponse } from '@kapa/shared';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  defaultSearchAdoptFilters,
  matchesSearchAdoptFilters,
  type SearchAdoptFilters,
} from '@/components/forms/searchAdopt/model';

export async function fetchAdoptAnimals(): Promise<Animal[]> {
  const response = await kapaService.get<
    ApiResponse<Animal[]> & { count?: number }
  >('/animals');

  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
}

export function useAdoptAnimals() {
  return useQuery<Animal[], Error>({
    queryKey: ['animals', 'adopt'],
    queryFn: fetchAdoptAnimals,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: (failureCount, error) => {
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403 || status === 404) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

export function useSearchAdopt(
  filters: SearchAdoptFilters = defaultSearchAdoptFilters,
) {
  const query = useAdoptAnimals();

  const filteredAnimals = useMemo<Animal[]>(() => {
    if (!query.data) return [];
    return query.data.filter((animal) =>
      matchesSearchAdoptFilters(animal, filters),
    );
  }, [query.data, filters]);

  return {
    ...query,
    animals: query.data ?? [],
    filteredAnimals,
    totalCount: query.data?.length ?? 0,
    filteredCount: filteredAnimals.length,
  };
}
