import { Router } from 'express';
import { createHealthController } from '../controllers/health.controller';
import type { SimulationMode } from '../domain/payment';

export function createHealthRouter(mode: SimulationMode): Router {
  const router = Router();
  router.get('/', createHealthController(mode));
  return router;
}
