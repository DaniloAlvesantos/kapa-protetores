import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AdopterProfile } from '../models/AdopterProfile';
import { UUID } from '../domains/UUID';

describe('AdopterProfile Domain Entity', () => {
  it('should initialize and set properties correctly', () => {
    const profile = new AdopterProfile();
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const userId = '987fcdeb-51a2-43f7-9abc-def012345678';

    profile.setId(id);
    profile.setUserId(userId);
    profile.setPreferredSpecies('dog');
    profile.setPreferredGender('female');
    profile.setPreferredSize(3);
    profile.setPreferredEnergy(4);
    profile.setPreferredKidFriendly(5);
    profile.setPreferredNoise(2);
    profile.setPreferredAgeStage(2);
    profile.setLivesInApartment(true);
    profile.setHasOtherPets(false);
    profile.setCreatedAt('2026-10-07T12:00:00.000Z');
    profile.setUpdatedAt('2026-10-07T12:30:00.000Z');

    assert.strictEqual(profile.getId().getValue(), id);
    assert.strictEqual(profile.getUserId().getValue(), userId);
    assert.strictEqual(profile.getPreferredSpecies(), 'dog');
    assert.strictEqual(profile.getPreferredGender(), 'female');
    assert.strictEqual(profile.getPreferredSize(), 3);
    assert.strictEqual(profile.getPreferredEnergy(), 4);
    assert.strictEqual(profile.getPreferredKidFriendly(), 5);
    assert.strictEqual(profile.getPreferredNoise(), 2);
    assert.strictEqual(profile.getPreferredAgeStage(), 2);
    assert.strictEqual(profile.getLivesInApartment(), true);
    assert.strictEqual(profile.getHasOtherPets(), false);
    assert.strictEqual(profile.getCreatedAt(), '2026-10-07T12:00:00.000Z');
    assert.strictEqual(profile.getUpdatedAt(), '2026-10-07T12:30:00.000Z');
  });

  it('should accept UUID domain instances in setId and setUserId', () => {
    const profile = new AdopterProfile();
    const idDomain = UUID.create('123e4567-e89b-12d3-a456-426614174000');
    const userDomain = UUID.create('987fcdeb-51a2-43f7-9abc-def012345678');

    profile.setId(idDomain);
    profile.setUserId(userDomain);

    assert.strictEqual(profile.getId().getValue(), idDomain.getValue());
    assert.strictEqual(profile.getUserId().getValue(), userDomain.getValue());
  });

  it('should not overwrite id or userId once set', () => {
    const profile = new AdopterProfile();
    const id1 = '123e4567-e89b-12d3-a456-426614174000';
    const id2 = '00000000-0000-0000-0000-000000000000';

    profile.setId(id1);
    profile.setId(id2);
    assert.strictEqual(profile.getId().getValue(), id1);

    profile.setUserId(id1);
    profile.setUserId(id2);
    assert.strictEqual(profile.getUserId().getValue(), id1);
  });

  it('should reject negative numeric values with ValidationError', () => {
    const profile = new AdopterProfile();

    assert.throws(() => profile.setPreferredSize(-1), {
      name: 'ValidationError',
    });
    assert.throws(() => profile.setPreferredEnergy(-2), {
      name: 'ValidationError',
    });
    assert.throws(() => profile.setPreferredKidFriendly(-1), {
      name: 'ValidationError',
    });
    assert.throws(() => profile.setPreferredNoise(-5), {
      name: 'ValidationError',
    });
    assert.throws(() => profile.setPreferredAgeStage(-1), {
      name: 'ValidationError',
    });
  });

  it('should allow null for optional preferences', () => {
    const profile = new AdopterProfile();
    profile.setPreferredSpecies(null);
    profile.setPreferredGender(null);
    profile.setPreferredSize(null);
    profile.setPreferredEnergy(null);
    profile.setPreferredKidFriendly(null);
    profile.setPreferredNoise(null);
    profile.setPreferredAgeStage(null);
    profile.setLivesInApartment(null);
    profile.setHasOtherPets(null);

    assert.strictEqual(profile.getPreferredSpecies(), null);
    assert.strictEqual(profile.getPreferredGender(), null);
    assert.strictEqual(profile.getPreferredSize(), null);
    assert.strictEqual(profile.getPreferredEnergy(), null);
    assert.strictEqual(profile.getPreferredKidFriendly(), null);
    assert.strictEqual(profile.getPreferredNoise(), null);
    assert.strictEqual(profile.getPreferredAgeStage(), null);
    assert.strictEqual(profile.getLivesInApartment(), null);
    assert.strictEqual(profile.getHasOtherPets(), null);
  });

  it('should produce correct DTO and JSON output', () => {
    const profile = new AdopterProfile();
    profile.setId('123e4567-e89b-12d3-a456-426614174000');
    profile.setUserId('987fcdeb-51a2-43f7-9abc-def012345678');
    profile.setPreferredSpecies('cat');
    profile.setPreferredGender('male');
    profile.setPreferredSize(2);
    profile.setPreferredEnergy(3);
    profile.setPreferredKidFriendly(4);
    profile.setPreferredNoise(1);
    profile.setPreferredAgeStage(1);
    profile.setLivesInApartment(true);
    profile.setHasOtherPets(true);
    profile.setCreatedAt('2026-10-07T10:00:00.000Z');
    profile.setUpdatedAt('2026-10-07T10:05:00.000Z');

    const dto = profile.toDTO();
    assert.deepStrictEqual(dto, {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '987fcdeb-51a2-43f7-9abc-def012345678',
      preferredSpecies: 'cat',
      preferredGender: 'male',
      preferredSize: 2,
      preferredEnergy: 3,
      preferredKidFriendly: 4,
      preferredNoise: 1,
      preferredAgeStage: 1,
      livesInApartment: true,
      hasOtherPets: true,
      createdAt: '2026-10-07T10:00:00.000Z',
      updatedAt: '2026-10-07T10:05:00.000Z',
    });

    assert.deepStrictEqual(profile.toJSON(), dto);
  });
});
