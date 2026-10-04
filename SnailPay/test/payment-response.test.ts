import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { paymentResponse } from '../src/domain/payment';
import { paymentFields, validPayment } from './fixtures';

test('construye una respuesta con todos los campos requeridos', () => {
  const response = paymentResponse(validPayment, 'rejected', 'card_declined');

  assert.deepEqual(Object.keys(response).sort(), [...paymentFields].sort());
  assert.equal(response.status, 'rejected');
  assert.equal(response.status_detail, 'card_declined');
  assert.equal(response.transaction_amount, validPayment.amount);
  assert.equal(response.payer_id, validPayment.payerId);
  assert.equal(response.payer_email, validPayment.payerEmail);
  assert.equal(response.card_number, validPayment.cardNumber);
  assert.equal(response.cvv, validPayment.cvv);
  assert.equal(response.authorization_code, null);
  assert.ok(response.id);
  assert.equal(response.reference, `SNAIL-${response.id}`);
  assert.ok(Number.isFinite(Date.parse(response.date_created)));
});

test('genera un identificador diferente para cada operación', () => {
  const first = paymentResponse(validPayment, 'error', 'system_unavailable');
  const second = paymentResponse(validPayment, 'error', 'system_unavailable');

  assert.notEqual(first.id, second.id);
  assert.notEqual(first.reference, second.reference);
});

test('puede construir una respuesta aunque no exista un body válido', () => {
  const response = paymentResponse(null, 'rejected', 'invalid_data');

  assert.deepEqual(Object.keys(response).sort(), [...paymentFields].sort());
  assert.equal(response.transaction_amount, 0);
  assert.equal(response.payer_id, '');
  assert.equal(response.payer_email, '');
  assert.equal(response.card_number, null);
  assert.equal(response.cvv, null);
  assert.equal(response.authorization_code, null);
});
