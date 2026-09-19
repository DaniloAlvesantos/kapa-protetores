import { animalsRouter } from './animals.routes';
import { ApiRouter } from './ApiRouter';
import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';

const apiRouterInstance = new ApiRouter(
  healthRouter,
  animalsRouter,
  authRouter,
);

export const apiRouter = apiRouterInstance;

