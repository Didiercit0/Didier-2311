import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { validatePayment } from '../src/validators/payment.validator';
import { validPayment } from './fixtures';

test('acepta los datos válidos del pago', () => {
  const result = validatePayment(validPayment);

  assert.deepEqual(result, { valid: true, data: validPayment });
});

test('rechaza un body vacío', () => {
  const result = validatePayment(null);

  assert.deepEqual(result, { valid: false, detail: 'invalid_data', httpStatus: 400 });
});

test('rechaza un nombre vacío', () => {
  const result = validatePayment({ ...validPayment, fullName: '   ' });

  assert.deepEqual(result, { valid: false, detail: 'invalid_data', httpStatus: 400 });
});

test('rechaza un identificador de usuario vacío', () => {
  const result = validatePayment({ ...validPayment, payerId: '' });

  assert.deepEqual(result, { valid: false, detail: 'invalid_data', httpStatus: 400 });
});

test('rechaza un correo inválido', () => {
  const result = validatePayment({ ...validPayment, payerEmail: 'correo-invalido' });

  assert.deepEqual(result, { valid: false, detail: 'invalid_data', httpStatus: 400 });
});

test('rechaza un monto de cero', () => {
  const result = validatePayment({ ...validPayment, amount: 0 });

  assert.deepEqual(result, { valid: false, detail: 'invalid_data', httpStatus: 400 });
});

test('rechaza un monto negativo', () => {
  const result = validatePayment({ ...validPayment, amount: -10 });

  assert.deepEqual(result, { valid: false, detail: 'invalid_data', httpStatus: 400 });
});

test('rechaza un monto con más de dos decimales', () => {
  const result = validatePayment({ ...validPayment, amount: 25.555 });

  assert.deepEqual(result, { valid: false, detail: 'invalid_data', httpStatus: 400 });
});

test('rechaza un monto que excede el máximo permitido', () => {
  const result = validatePayment({ ...validPayment, amount: 100001 });

  assert.deepEqual(result, { valid: false, detail: 'invalid_data', httpStatus: 400 });
});

test('acepta el monto mínimo de un centavo', () => {
  const input = { ...validPayment, amount: 0.01 };
  const result = validatePayment(input);

  assert.deepEqual(result, { valid: true, data: input });
});

test('rechaza una tarjeta con menos de 16 dígitos', () => {
  const result = validatePayment({ ...validPayment, cardNumber: '1234' });

  assert.deepEqual(result, { valid: false, detail: 'invalid_card', httpStatus: 400 });
});

test('rechaza un vencimiento con formato inválido', () => {
  const result = validatePayment({ ...validPayment, expirationDate: '2026-12' });

  assert.deepEqual(result, { valid: false, detail: 'invalid_expiration', httpStatus: 400 });
});

test('rechaza un CVV con letras', () => {
  const result = validatePayment({ ...validPayment, cvv: 'abc' });

  assert.deepEqual(result, { valid: false, detail: 'invalid_cvv', httpStatus: 400 });
});
