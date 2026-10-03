import { randomBytes } from 'node:crypto';
import { paymentResponse } from '../domain/payment';
import type { ChargeResult, SimulationMode } from '../domain/payment';
import { DECLINED_CARD, INSUFFICIENT_FUNDS_CARD } from '../domain/payment-rules';
import { validatePayment } from '../validators/payment.validator';

export { APPROVED_CARD, DECLINED_CARD, INSUFFICIENT_FUNDS_CARD, MAX_AMOUNT } from '../domain/payment-rules';

export function chargePayment(body: unknown, mode: SimulationMode = 'normal'): ChargeResult {
  const result = (
    status: 'approved' | 'rejected' | 'error',
    detail: string,
    httpStatus: number,
  ): ChargeResult => ({
    httpStatus,
    payment: paymentResponse(body, status, detail),
  });

  if (mode === 'system_error') return result('error', 'system_unavailable', 503);
  if (mode === 'timeout') return result('error', 'gateway_timeout', 504);

  const validation = validatePayment(body);
  if (!validation.valid) {
    return result('rejected', validation.detail, validation.httpStatus);
  }

  const { cardNumber } = validation.data;
  if (cardNumber === DECLINED_CARD) return result('rejected', 'card_declined', 402);
  if (cardNumber === INSUFFICIENT_FUNDS_CARD) return result('rejected', 'insufficient_funds', 402);

  const approved = result('approved', 'accredited', 200);
  approved.payment.authorization_code = `TEST-${randomBytes(4).toString('hex').toUpperCase()}`;
  return approved;
}
