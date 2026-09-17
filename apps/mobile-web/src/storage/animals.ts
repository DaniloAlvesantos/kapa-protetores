import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Animal } from '../types/animal';

const KEY = '@kapa/animals';

export async function listAnimals(): Promise<Animal[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Animal => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.nome === 'string' &&
        typeof candidate.createdAt === 'string'
      );
    });
  } catch {
    return [];
  }
}

export async function saveAnimal(animal: Animal): Promise<void> {
  const animals = await listAnimals();
  animals.unshift(animal);
  await AsyncStorage.setItem(KEY, JSON.stringify(animals));
}
