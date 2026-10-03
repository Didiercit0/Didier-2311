import type { RequestHandler } from 'express';
import { paymentResponse } from '../domain/payment';

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json(paymentResponse(req.body, 'error', 'route_not_found'));
};
