import type { RequestHandler } from 'express';
import type { SimulationMode } from '../domain/payment';

export function createHealthController(mode: SimulationMode): RequestHandler {
  return (_req, res) => {
    res.json({ service: 'SnailPay', simulated: true, mode });
  };
}
