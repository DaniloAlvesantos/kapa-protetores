import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AdopterProfileService } from '../services/AdopterProfileService';
import { IAdopterProfileRepository, AdopterPreferences } from '../interfaces';
import { AdopterProfile } from '../models';
import { UUID } from '../domains/UUID';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../errors';

class MockAdopterProfileRepository implements IAdopterProfileRepository {
  public profiles: AdopterProfile[] = [];

  async count(): Promise<number> {
    return this.profiles.length;
  }

  async findAll(): Promise<AdopterProfile[]> {
    return [...this.profiles];
  }

  async findById(id: UUID): Promise<AdopterProfile | null> {
    const found = this.profiles.find((p) => p.getId().equals(id));
    return found ?? null;
  }

  async findByUserId(userId: UUID): Promise<AdopterProfile | null> {
    const found = this.profiles.find((p) => p.getUserId().equals(userId));
    return found ?? null;
  }

  async findByPreferences(
    filters: Partial<AdopterPreferences>,
  ): Promise<AdopterProfile[]> {
    return this.profiles.filter((p) => {
      if (
        filters.preferredSpecies !== undefined &&
        p.getPreferredSpecies() !== filters.preferredSpecies
      ) {
        return false;
      }
      if (
        filters.preferredGender !== undefined &&
        p.getPreferredGender() !== filters.preferredGender
      ) {
        return false;
      }
      if (
        filters.livesInApartment !== undefined &&
        p.getLivesInApartment() !== filters.livesInApartment
      ) {
        return false;
      }
      return true;
    });
  }

  async findByPreference<K extends keyof AdopterPreferences>(
    key: K,
    value: AdopterPreferences[K],
  ): Promise<AdopterProfile[]> {
    return this.findByPreferences({ [key]: value } as Partial<AdopterPreferences>);
  }

  async create(adopterProfile: AdopterProfile): Promise<AdopterProfile> {
    if (!adopterProfile.getId()) {
      adopterProfile.setId(UUID.generate());
    }
    adopterProfile.setCreatedAt(new Date().toISOString());
    adopterProfile.setUpdatedAt(new Date().toISOString());
    this.profiles.push(adopterProfile);
    return adopterProfile;
  }

  async update(updatedProfile: AdopterProfile): Promise<AdopterProfile> {
    const index = this.profiles.findIndex(
      (p) =>
        (updatedProfile.getId() && p.getId().equals(updatedProfile.getId())) ||
        p.getUserId().equals(updatedProfile.getUserId()),
    );
    if (index === -1) {
      throw new Error('Not found');
    }
    updatedProfile.setUpdatedAt(new Date().toISOString());
    this.profiles[index] = updatedProfile;
    return updatedProfile;
  }

  async deleteById(id: UUID): Promise<AdopterProfile | null> {
    const index = this.profiles.findIndex((p) => p.getId().equals(id));
    if (index === -1) return null;
    const [deleted] = this.profiles.splice(index, 1);
    return deleted;
  }

  async deleteByUserId(userId: UUID): Promise<AdopterProfile | null> {
    const index = this.profiles.findIndex((p) => p.getUserId().equals(userId));
    if (index === -1) return null;
    const [deleted] = this.profiles.splice(index, 1);
    return deleted;
  }
}

describe('AdopterProfileService', () => {
  let repository: MockAdopterProfileRepository;
  let service: AdopterProfileService;
  const sampleUserId = '123e4567-e89b-12d3-a456-426614174000';
  const sampleProfileId = '223e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    repository = new MockAdopterProfileRepository();
    service = new AdopterProfileService(repository);
  });

  it('should countAll and getAll profiles', async () => {
    assert.strictEqual(await service.countAll(), 0);
    assert.deepStrictEqual(await service.getAll(), []);

    await service.create({
      userId: sampleUserId,
      preferredSpecies: 'dog',
    });

    assert.strictEqual(await service.countAll(), 1);
    const all = await service.getAll();
    assert.strictEqual(all.length, 1);
    assert.strictEqual(all[0].getPreferredSpecies(), 'dog');
  });

  it('should get profile by id or throw NotFoundError', async () => {
    const created = await service.create({
      userId: sampleUserId,
      preferredSpecies: 'cat',
    });

    const found = await service.getById(created.getId().getValue());
    assert.strictEqual(found.getUserId().getValue(), sampleUserId);

    await assert.rejects(
      () => service.getById('999e4567-e89b-12d3-a456-426614174999'),
      NotFoundError,
    );
  });

  it('should get profile by userId or throw NotFoundError', async () => {
    await service.create({
      userId: sampleUserId,
      preferredGender: 'female',
    });

    const found = await service.getByUserId(sampleUserId);
    assert.strictEqual(found.getPreferredGender(), 'female');

    await assert.rejects(
      () => service.getByUserId('999e4567-e89b-12d3-a456-426614174999'),
      NotFoundError,
    );
  });

  it('should create an adopter profile and reject duplicate for same user', async () => {
    const created = await service.create({
      userId: sampleUserId,
      preferredSpecies: 'dog',
      preferredSize: 3,
      livesInApartment: true,
    });

    assert.strictEqual(created.getPreferredSpecies(), 'dog');
    assert.strictEqual(created.getPreferredSize(), 3);
    assert.strictEqual(created.getLivesInApartment(), true);

    await assert.rejects(
      () =>
        service.create({
          userId: sampleUserId,
        }),
      ConflictError,
    );
  });

  it('should reject create with missing or invalid input', async () => {
    await assert.rejects(
      () => service.create(null as any),
      BadRequestError,
    );

    await assert.rejects(
      () => service.create({ userId: '' } as any),
      BadRequestError,
    );
  });

  it('should update profile by userId', async () => {
    await service.create({
      userId: sampleUserId,
      preferredSpecies: 'dog',
      preferredEnergy: 2,
    });

    const updated = await service.updateByUserId(sampleUserId, {
      preferredSpecies: 'cat',
      preferredEnergy: 5,
      hasOtherPets: true,
    });

    assert.strictEqual(updated.getPreferredSpecies(), 'cat');
    assert.strictEqual(updated.getPreferredEnergy(), 5);
    assert.strictEqual(updated.getHasOtherPets(), true);
  });

  it('should throw NotFoundError when updating non-existent profile by userId', async () => {
    await assert.rejects(
      () =>
        service.updateByUserId(sampleUserId, {
          preferredSpecies: 'dog',
        }),
      NotFoundError,
    );
  });

  it('should upsert profile correctly (create when absent, update when present)', async () => {
    const created = await service.upsert(sampleUserId, {
      preferredSpecies: 'dog',
      preferredSize: 2,
    });
    assert.strictEqual(created.getPreferredSpecies(), 'dog');
    assert.strictEqual(created.getPreferredSize(), 2);

    const updated = await service.upsert(sampleUserId, {
      preferredSize: 4,
    });
    assert.strictEqual(updated.getPreferredSpecies(), 'dog');
    assert.strictEqual(updated.getPreferredSize(), 4);
    assert.strictEqual(await service.countAll(), 1);
  });

  it('should delete profile by id and by userId', async () => {
    const profile1 = await service.create({
      userId: sampleUserId,
    });
    const profile2 = await service.create({
      userId: '333e4567-e89b-12d3-a456-426614174333',
    });

    const deleted1 = await service.delete(profile1.getId().getValue());
    assert.strictEqual(deleted1.getId().getValue(), profile1.getId().getValue());
    assert.strictEqual(await service.countAll(), 1);

    const deleted2 = await service.deleteByUserId('333e4567-e89b-12d3-a456-426614174333');
    assert.strictEqual(deleted2.getId().getValue(), profile2.getId().getValue());
    assert.strictEqual(await service.countAll(), 0);

    await assert.rejects(
      () => service.delete(sampleProfileId),
      NotFoundError,
    );
  });
});
