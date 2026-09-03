import dotenv from 'dotenv';
import { App } from './App';
import { InMemoryAnimalRepository } from './repositories/InMemoryAnimalRepository';
import { AnimalService } from './services/AnimalService';
import { HealthService } from './services/HealthService';
import { AnimalsController } from './controllers/AnimalsController';
import { HealthController } from './controllers/HealthController';
import { AnimalsRouter } from './routes/AnimalsRouter';
import { HealthRouter } from './routes/HealthRouter';
import { ApiRouter } from './routes/ApiRouter';

dotenv.config();

const port = Number(process.env.PORT) || 4000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:8081';

// Composition Root (Dependency Injection / Inversion of Control)
const animalRepository = new InMemoryAnimalRepository();
const animalService = new AnimalService(animalRepository);
const healthService = new HealthService();

const animalsController = new AnimalsController(animalService);
const healthController = new HealthController(healthService);

const animalsRouter = new AnimalsRouter(animalsController);
const healthRouter = new HealthRouter(healthController);

const apiRouter = new ApiRouter(healthRouter, animalsRouter);

const application = new App(apiRouter, { port, clientUrl });

application.listen();

// Graceful shutdown
const handleShutdown = async (signal: string): Promise<void> => {
  console.log(`\n[Server]: ${signal} received, closing HTTP server gracefully...`);
  await application.close();
  process.exit(0);
};

process.on('SIGINT', () => void handleShutdown('SIGINT'));
process.on('SIGTERM', () => void handleShutdown('SIGTERM'));

export { application };
