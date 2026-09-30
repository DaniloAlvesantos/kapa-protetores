import { Request, Response, NextFunction } from 'express';
import { AnimalService } from '../services/AnimalService';
import { AppError } from '../errors/AppError';
import type { ApiResponse } from '@kapa/shared';

export class AnimalsController {
  constructor(private readonly animalService: AnimalService) {}

  public getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.animalService.getAll();
      const response: ApiResponse<typeof data> & { count: number } = {
        success: true,
        message: 'Animais listados com sucesso',
        data,
        count: data.length,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramId = req.params.id;
      const id = Array.isArray(paramId) ? paramId[0] : paramId;
      if (!id) {
        throw AppError.badRequest('ID inválido.');
      }
      const data = await this.animalService.getById(id);
      const response: ApiResponse<typeof data> = {
        success: true,
        message: 'Animal obtido com sucesso',
        data,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.animalService.create(req.body);
      const response: ApiResponse<typeof data> = {
        success: true,
        message: 'Animal cadastrado com sucesso',
        data,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}
