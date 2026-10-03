import { Router } from 'express';
import type { AppConfig } from '../config/app-options';
import { createPaymentController } from '../controllers/payment.controller';

export function createPaymentRouter(config: AppConfig): Router {
  const router = Router();
  router.post('/', createPaymentController(config));
  return router;
}
