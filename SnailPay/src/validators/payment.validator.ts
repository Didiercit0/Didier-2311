import {
  EXPIRED_EXPIRATION,
  MAX_AMOUNT,
  SUPPORTED_CARDS,
  VALID_CVV,
  VALID_EXPIRATION,
} from '../domain/payment-rules';

export interface PaymentInput {
  fullName: string;
  payerId: string;
  payerEmail: string;
  amount: number;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
}

type ValidationResult =
  | { valid: true; data: PaymentInput }
  | { valid: false; detail: string; httpStatus: 400 | 402 };

export function validatePayment(body: unknown): ValidationResult {
  const reject = (detail: string, httpStatus: 400 | 402 = 400): ValidationResult =>
    ({ valid: false, detail, httpStatus });

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return reject('invalid_data');
  }

  const input = body as Record<string, unknown>;
  if (
    typeof input.fullName !== 'string' || !input.fullName.trim() ||
    typeof input.payerId !== 'string' || !input.payerId.trim() ||
    typeof input.payerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.payerEmail)
  ) {
    return reject('invalid_data');
  }

  if (
    typeof input.amount !== 'number' || !Number.isFinite(input.amount) ||
    input.amount < 0.01 || input.amount > MAX_AMOUNT ||
    Math.abs(input.amount * 100 - Math.round(input.amount * 100)) >
      Number.EPSILON * Math.max(1, input.amount * 100) * 2
  ) {
    return reject('invalid_data');
  }

  if (
    typeof input.cardNumber !== 'string' || !/^\d{16}$/.test(input.cardNumber) ||
    !SUPPORTED_CARDS.includes(input.cardNumber)
  ) {
    return reject('invalid_card');
  }

  if (
    typeof input.expirationDate !== 'string' ||
    !/^(0[1-9]|1[0-2])\/\d{2}$/.test(input.expirationDate)
  ) {
    return reject('invalid_expiration');
  }
  // Son datos ficticios del simulador, no una comparación con la fecha actual.
  if (input.expirationDate === EXPIRED_EXPIRATION) {
    return reject('expired_card', 402);
  }
  if (input.expirationDate !== VALID_EXPIRATION) {
    return reject('invalid_expiration', 402);
  }

  if (typeof input.cvv !== 'string' || !/^\d{3,4}$/.test(input.cvv)) {
    return reject('invalid_cvv');
  }
  if (input.cvv !== VALID_CVV) {
    return reject('invalid_cvv', 402);
  }

  return {
    valid: true,
    data: {
      fullName: input.fullName,
      payerId: input.payerId,
      payerEmail: input.payerEmail,
      amount: input.amount,
      cardNumber: input.cardNumber,
      expirationDate: input.expirationDate,
      cvv: input.cvv,
    },
  };
}
