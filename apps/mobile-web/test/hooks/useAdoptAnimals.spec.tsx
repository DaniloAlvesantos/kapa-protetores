import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdoptAnimals, useSearchAdopt } from '../../src/hooks/useAdoptAnimals';
import { kapaService } from '../../src/services/kapaService';
import type { Animal } from '@kapa/shared';

jest.mock('../../src/services/kapaService', () => ({
  kapaService: {
    get: jest.fn(),
  },
}));

const mockAnimals: Animal[] = [
  {
    id: 'animal-1',
    name: 'Rex',
    breed: 'Pastor Alemão',
    species: 'dog',
    gender: 'male',
    size: 4, // Grande
    weightKg: 30,
    age: 3,
    ageStage: 2,
    energyLevel: 4,
    kidFriendly: 4,
    noiseLevel: 3,
    apartmentFriendly: false,
    otherPetFriendly: true,
    healthCondition: 'healthy',
    castrated: 'yes',
    vaccinated: true,
    dewormed: 'yes',
    rescuedAt: '2026-01-01T00:00:00.000Z',
    place: 'Zona Norte',
    mood: 'Protetor e esperto',
    status: 'available',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'animal-2',
    name: 'Mimi',
    breed: 'Siamês',
    species: 'cat',
    gender: 'female',
    size: 2, // Pequeno
    weightKg: 4,
    age: 1,
    ageStage: 1,
    energyLevel: 2,
    kidFriendly: 5,
    noiseLevel: 1,
    apartmentFriendly: true,
    otherPetFriendly: true,
    healthCondition: 'healthy',
    castrated: 'yes',
    vaccinated: true,
    dewormed: 'yes',
    rescuedAt: '2026-02-01T00:00:00.000Z',
    place: 'Centro',
    mood: 'Dócil e tranquila',
    status: 'available',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

function TestConsumer({
  filters,
}: {
  filters?: { breed: string; specie: 'all' | 'dog' | 'cat'; gender: 'all' | 'male' | 'female'; size: 'all' | 'small' | 'medium' | 'large' };
}) {
  const { filteredAnimals, isLoading, totalCount } = useSearchAdopt(filters);

  if (isLoading) {
    return <Text testID="loading">Carregando...</Text>;
  }

  return (
    <View>
      <Text testID="total-count">{totalCount}</Text>
      <Text testID="filtered-count">{filteredAnimals.length}</Text>
      {filteredAnimals.map((a) => (
        <Text key={a.id} testID={`animal-${a.id}`}>
          {a.name}
        </Text>
      ))}
    </View>
  );
}

describe('useAdoptAnimals and useSearchAdopt hooks with TanStack Query', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('fetches animals using TanStack Query and returns all animals with default filters', async () => {
    (kapaService.get as jest.Mock).mockResolvedValueOnce({
      data: {
        data: mockAnimals,
      },
    });

    await render(
      <QueryClientProvider client={queryClient}>
        <TestConsumer />
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId('animal-animal-1')).toBeTruthy();
    expect(screen.getByTestId('animal-animal-2')).toBeTruthy();
    expect(screen.getByTestId('total-count').props.children).toBe(2);
    expect(screen.getByTestId('filtered-count').props.children).toBe(2);
  });

  it('filters animals by species in useSearchAdopt', async () => {
    (kapaService.get as jest.Mock).mockResolvedValueOnce({
      data: {
        data: mockAnimals,
      },
    });

    await render(
      <QueryClientProvider client={queryClient}>
        <TestConsumer
          filters={{
            breed: '',
            specie: 'cat',
            gender: 'all',
            size: 'all',
          }}
        />
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId('animal-animal-2')).toBeTruthy();
    expect(screen.queryByTestId('animal-animal-1')).toBeNull();
    expect(screen.getByTestId('total-count').props.children).toBe(2);
    expect(screen.getByTestId('filtered-count').props.children).toBe(1);
  });
});
