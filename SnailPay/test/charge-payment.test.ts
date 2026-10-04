import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { chargePayment } from '../src/application/charge-payment';
import { validPayment } from './fixtures';

test('aprueba el pago con los datos definidos en el desafío', () => {
  const result = chargePayment(validPayment);

  assert.equal(result.httpStatus, 200);
  assert.equal(result.payment.status, 'approved');
  assert.equal(result.payment.status_detail, 'accredited');
  assert.equal(result.payment.transaction_amount, 25.5);
  assert.match(result.payment.authorization_code ?? '', /^TEST-[A-F0-9]{8}$/);
});

test('rechaza una tarjeta no reconocida por el simulador', () => {
  const result = chargePayment({ ...validPayment, cardNumber: '1111111111111111' });

  assert.equal(result.httpStatus, 400);
  assert.equal(result.payment.status, 'rejected');
  assert.equal(result.payment.status_detail, 'invalid_card');
  assert.equal(result.payment.authorization_code, null);
});

test('rechaza la tarjeta de prueba configurada como declinada', () => {
  const result = chargePayment({ ...validPayment, cardNumber: '4000000000000002' });

  assert.equal(result.httpStatus, 402);
  assert.equal(result.payment.status, 'rejected');
  assert.equal(result.payment.status_detail, 'card_declined');
  assert.equal(result.payment.authorization_code, null);
});

test('rechaza la tarjeta de prueba sin fondos suficientes', () => {
  const result = chargePayment({ ...validPayment, cardNumber: '4000000000009995' });

  assert.equal(result.httpStatus, 402);
  assert.equal(result.payment.status, 'rejected');
  assert.equal(result.payment.status_detail, 'insufficient_funds');
  assert.equal(result.payment.authorization_code, null);
});

test('rechaza la tarjeta de prueba vencida', () => {
  const result = chargePayment({ ...validPayment, expirationDate: '01/20' });

  assert.equal(result.httpStatus, 402);
  assert.equal(result.payment.status, 'rejected');
  assert.equal(result.payment.status_detail, 'expired_card');
  assert.equal(result.payment.authorization_code, null);
});

test('rechaza un vencimiento distinto al autorizado en la simulación', () => {
  const result = chargePayment({ ...validPayment, expirationDate: '11/26' });

  assert.equal(result.httpStatus, 402);
  assert.equal(result.payment.status, 'rejected');
  assert.equal(result.payment.status_detail, 'invalid_expiration');
  assert.equal(result.payment.authorization_code, null);
});

test('rechaza un CVV distinto al autorizado en la simulación', () => {
  const result = chargePayment({ ...validPayment, cvv: '123' });

  assert.equal(result.httpStatus, 402);
  assert.equal(result.payment.status, 'rejected');
  assert.equal(result.payment.status_detail, 'invalid_cvv');
  assert.equal(result.payment.authorization_code, null);
});

test('system_error nunca aprueba, aunque los datos sean válidos', () => {
  const result = chargePayment(validPayment, 'system_error');

  assert.equal(result.httpStatus, 503);
  assert.equal(result.payment.status, 'error');
  assert.equal(result.payment.status_detail, 'system_unavailable');
  assert.equal(result.payment.authorization_code, null);
});

test('timeout devuelve un error sin código de autorización', () => {
  const result = chargePayment(validPayment, 'timeout');

  assert.equal(result.httpStatus, 504);
  assert.equal(result.payment.status, 'error');
  assert.equal(result.payment.status_detail, 'gateway_timeout');
  assert.equal(result.payment.authorization_code, null);
});
