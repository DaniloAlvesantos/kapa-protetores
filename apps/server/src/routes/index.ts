import { Router } from 'express';
import { healthRouter } from './health.routes';
import { animalsRouter } from './animals.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/animals', animalsRouter);
