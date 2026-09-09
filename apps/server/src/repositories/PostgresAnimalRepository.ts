import { PrismaClient } from '@prisma/client';
import { IAnimalRepository } from '../interfaces/AnimalRepositoryInterface';
import { Animal } from '../models/Animal';
import type { Animal as PrismaAnimal } from '@prisma/client';

export class PostgresAnimalRepository implements IAnimalRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  private mapToDomain(record: PrismaAnimal): Animal {
    return new Animal({
      id: record.id,
      nome: record.nome,
      especie: record.especie,
      sexo: record.sexo,
      porte: record.porte,
      idadeAproximada: record.idadeAproximada,
      corPelagem: record.corPelagem,
      dataResgate: record.dataResgate,
      localResgate: record.localResgate,
      condicaoChegada: record.condicaoChegada,
      castrado: record.castrado,
      vacinado: record.vacinado,
      vermifugado: record.vermifugado,
      temperamento: record.temperamento,
      observacoes: record.observacoes,
      fotoUri: record.fotoUri ?? undefined,
      status: record.status,
      createdAt: record.createdAt.toISOString(),
    });
  }

  public async findAll(): Promise<Animal[]> {
    const records = await this.prismaClient.animal.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.mapToDomain(record));
  }

  public async findById(id: string): Promise<Animal | null> {
    const record = await this.prismaClient.animal.findUnique({
      where: { id },
    });
    return record ? this.mapToDomain(record) : null;
  }

  public async create(animal: Animal): Promise<Animal> {
    const record = await this.prismaClient.animal.create({
      data: {
        id: animal.id,
        nome: animal.nome,
        especie: animal.especie,
        sexo: animal.sexo,
        porte: animal.porte,
        idadeAproximada: animal.idadeAproximada,
        corPelagem: animal.corPelagem,
        dataResgate: animal.dataResgate,
        localResgate: animal.localResgate,
        condicaoChegada: animal.condicaoChegada,
        castrado: animal.castrado,
        vacinado: animal.vacinado,
        vermifugado: animal.vermifugado,
        temperamento: animal.temperamento,
        observacoes: animal.observacoes,
        fotoUri: animal.fotoUri ?? null,
        status: animal.status,
      },
    });
    return this.mapToDomain(record);
  }
}
