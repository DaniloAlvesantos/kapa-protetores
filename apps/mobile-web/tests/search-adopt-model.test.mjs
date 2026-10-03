import assert from 'node:assert/strict';
import test from 'node:test';
import {
  searchAdoptSchema,
  defaultSearchAdoptFilters,
  matchesSearchAdoptFilters,
} from '../src/components/forms/searchAdopt/model.ts';

const baseAnimal = {
  id: 'animal-1',
  name: 'Pipoca',
  breed: 'Vira-lata',
  species: 'dog',
  gender: 'female',
  size: 2, // Pequeno
  weightKg: 8,
  age: 2,
  ageStage: 1,
  energyLevel: 3,
  kidFriendly: 5,
  noiseLevel: 2,
  apartmentFriendly: true,
  otherPetFriendly: true,
  healthCondition: 'healthy',
  castrated: 'yes',
  vaccinated: true,
  dewormed: 'yes',
  rescuedAt: '2026-01-01T00:00:00.000Z',
  place: 'Centro',
  mood: 'Dócil e carinhosa',
  status: 'available',
  createdAt: '2026-01-01T00:00:00.000Z',
};

test('searchAdoptSchema validates defaults and expected types', () => {
  const result = searchAdoptSchema.parse({});
  assert.deepEqual(result, defaultSearchAdoptFilters);

  const custom = searchAdoptSchema.parse({
    breed: 'poodle',
    specie: 'dog',
    gender: 'male',
    size: 'small',
  });
  assert.equal(custom.breed, 'poodle');
  assert.equal(custom.specie, 'dog');
  assert.equal(custom.gender, 'male');
  assert.equal(custom.size, 'small');
});

test('searchAdoptSchema rejects invalid enum values', () => {
  assert.equal(
    searchAdoptSchema.safeParse({ specie: 'bird' }).success,
    false,
  );
  assert.equal(
    searchAdoptSchema.safeParse({ gender: 'unknown' }).success,
    false,
  );
  assert.equal(
    searchAdoptSchema.safeParse({ size: 'huge' }).success,
    false,
  );
});

test('matchesSearchAdoptFilters filters by name or breed case-insensitively', () => {
  // Matches name
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      breed: 'pipo',
    }),
    true,
  );

  // Matches breed
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      breed: 'VIRA-LATA',
    }),
    true,
  );

  // Does not match
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      breed: 'Labrador',
    }),
    false,
  );
});

test('matchesSearchAdoptFilters filters by species correctly', () => {
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      specie: 'all',
    }),
    true,
  );
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      specie: 'dog',
    }),
    true,
  );
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      specie: 'cat',
    }),
    false,
  );
});

test('matchesSearchAdoptFilters filters by gender correctly', () => {
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      gender: 'all',
    }),
    true,
  );
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      gender: 'female',
    }),
    true,
  );
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      gender: 'male',
    }),
    false,
  );
});

test('matchesSearchAdoptFilters filters by size correctly', () => {
  // baseAnimal has size: 2 (small)
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      size: 'small',
    }),
    true,
  );
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      size: 'medium',
    }),
    false,
  );
  assert.equal(
    matchesSearchAdoptFilters(baseAnimal, {
      ...defaultSearchAdoptFilters,
      size: 'large',
    }),
    false,
  );

  // Test animal with size 3 (medium) and size 4 (large)
  const mediumAnimal = { ...baseAnimal, size: 3 };
  assert.equal(
    matchesSearchAdoptFilters(mediumAnimal, {
      ...defaultSearchAdoptFilters,
      size: 'medium',
    }),
    true,
  );
  assert.equal(
    matchesSearchAdoptFilters(mediumAnimal, {
      ...defaultSearchAdoptFilters,
      size: 'small',
    }),
    false,
  );

  const largeAnimal = { ...baseAnimal, size: 4 };
  assert.equal(
    matchesSearchAdoptFilters(largeAnimal, {
      ...defaultSearchAdoptFilters,
      size: 'large',
    }),
    true,
  );
});
