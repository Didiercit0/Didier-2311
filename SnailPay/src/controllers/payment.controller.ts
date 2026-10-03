import type { RequestHandler } from 'express';
import { chargePayment } from '../application/charge-payment';
import type { AppConfig } from '../config/app-options';

export function createPaymentController(config: AppConfig): RequestHandler {
  return (req, res) => {
    const result = chargePayment(req.body, config.mode);

    if (config.mode === 'timeout') {
      const timer = setTimeout(() => {
        if (!res.destroyed) res.status(result.httpStatus).json(result.payment);
      }, config.timeoutDelayMs);
      res.on('close', () => clearTimeout(timer));
      return;
    }

    res.status(result.httpStatus).json(result.payment);
  };
}
