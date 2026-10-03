import type { NextFunction, Request, Response } from 'express';
import { paymentResponse } from '../domain/payment';

type HttpError = Error & { type?: string };

export function errorHandler(error: HttpError, req: Request, res: Response, _next: NextFunction): void {
  const malformed = error instanceof SyntaxError && 'body' in error;
  const tooLarge = error.type === 'entity.too.large';
  const status = tooLarge ? 413 : malformed ? 400 : 500;
  const detail = tooLarge ? 'request_too_large' : malformed ? 'invalid_data' : 'system_unavailable';

  res.status(status).json(paymentResponse(req.body, status < 500 ? 'rejected' : 'error', detail));
}
