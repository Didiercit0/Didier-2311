import express from 'express';
import { resolveAppConfig } from './config/app-options';
import type { AppOptions } from './config/app-options';
import { errorHandler } from './middlewares/error-handler';
import { notFound } from './middlewares/not-found';
import { createHealthRouter } from './routes/health.routes';
import { createPaymentRouter } from './routes/payment.routes';

export type { AppOptions } from './config/app-options';

export function createSnailPayApp(options: AppOptions = {}) {
  const config = resolveAppConfig(options);
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb', strict: false }));
  app.use('/health', createHealthRouter(config.mode));
  app.use('/payments', createPaymentRouter(config));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
