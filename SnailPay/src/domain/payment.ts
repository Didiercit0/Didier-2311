import { randomUUID } from 'node:crypto';

export type SimulationMode = 'normal' | 'system_error' | 'timeout';
export interface PaymentResponse {
  id: string;
  status: 'approved' | 'rejected' | 'error';
  status_detail: string;
  transaction_amount: number;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string;
  payer_email: string;
  card_number: string | null;
  cvv: string | null;
}
export interface ChargeResult { httpStatus: number; payment: PaymentResponse }

export function paymentResponse(body: unknown, status: PaymentResponse['status'], detail: string): PaymentResponse {
  const input = body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : {};
  const id = randomUUID();
  return {
    id, status, status_detail: detail,
    transaction_amount: typeof input.amount === 'number' && Number.isFinite(input.amount) ? input.amount : 0,
    date_created: new Date().toISOString(), authorization_code: null, reference: `SNAIL-${id}`,
    payer_id: typeof input.payerId === 'string' ? input.payerId : '',
    payer_email: typeof input.payerEmail === 'string' ? input.payerEmail : '',
    card_number: typeof input.cardNumber === 'string' && /^\d{16}$/.test(input.cardNumber) ? input.cardNumber : null,
    cvv: typeof input.cvv === 'string' && /^\d{3,4}$/.test(input.cvv) ? input.cvv : null,
  };
}
