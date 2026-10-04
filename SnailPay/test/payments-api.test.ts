import * as assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';
import type { TestContext } from 'node:test';
import { createSnailPayApp } from '../src/app';
import type { AppOptions } from '../src/app';
import { paymentFields, validPayment } from './fixtures';

async function startApi(context: TestContext, options: AppOptions = {}): Promise<string> {
  const app = createSnailPayApp(options);
  const server = app.listen(0, '127.0.0.1');
  context.after(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

function postPayment(url: string, body: unknown = validPayment) {
  return fetch(`${url}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('POST /payments devuelve 200 y los campos del pago aprobado', async context => {
  const url = await startApi(context);
  const response = await postPayment(url);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'approved');
  assert.equal(body.status_detail, 'accredited');
  assert.deepEqual(Object.keys(body).sort(), [...paymentFields].sort());
  assert.equal(body.transaction_amount, validPayment.amount);
  assert.equal(body.payer_id, validPayment.payerId);
  assert.equal(body.payer_email, validPayment.payerEmail);
  assert.equal(body.card_number, validPayment.cardNumber);
  assert.equal(body.cvv, validPayment.cvv);
  assert.match(body.authorization_code, /^TEST-[A-F0-9]{8}$/);
});

test('POST /payments devuelve 402 cuando la tarjeta es rechazada', async context => {
  const url = await startApi(context);
  const response = await postPayment(url, { ...validPayment, cardNumber: '4000000000000002' });
  const body = await response.json();

  assert.equal(response.status, 402);
  assert.equal(body.status, 'rejected');
  assert.equal(body.status_detail, 'card_declined');
  assert.deepEqual(Object.keys(body).sort(), [...paymentFields].sort());
  assert.equal(body.card_number, '4000000000000002');
  assert.equal(body.cvv, validPayment.cvv);
  assert.equal(body.authorization_code, null);
});

test('POST /payments devuelve 400 cuando el monto no es válido', async context => {
  const url = await startApi(context);
  const response = await postPayment(url, { ...validPayment, amount: 0 });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.status, 'rejected');
  assert.equal(body.status_detail, 'invalid_data');
  assert.equal(body.authorization_code, null);
});

test('POST /payments devuelve 503 en el modo system_error', async context => {
  const url = await startApi(context, { mode: 'system_error' });
  const response = await postPayment(url);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.status, 'error');
  assert.equal(body.status_detail, 'system_unavailable');
  assert.deepEqual(Object.keys(body).sort(), [...paymentFields].sort());
  assert.equal(body.card_number, validPayment.cardNumber);
  assert.equal(body.cvv, validPayment.cvv);
  assert.equal(body.authorization_code, null);
});

test('POST /payments devuelve 504 en el modo timeout', async context => {
  // Solo esperamos 20 ms para que la prueba sea rápida.
  const url = await startApi(context, { mode: 'timeout', timeoutDelayMs: 20 });
  const response = await postPayment(url);
  const body = await response.json();

  assert.equal(response.status, 504);
  assert.equal(body.status, 'error');
  assert.equal(body.status_detail, 'gateway_timeout');
  assert.deepEqual(Object.keys(body).sort(), [...paymentFields].sort());
  assert.equal(body.authorization_code, null);
});

test('POST /payments devuelve 400 cuando el JSON está mal escrito', async context => {
  const url = await startApi(context);
  const response = await fetch(`${url}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"amount":',
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.status, 'rejected');
  assert.equal(body.status_detail, 'invalid_data');
  assert.deepEqual(Object.keys(body).sort(), [...paymentFields].sort());
  assert.equal(body.authorization_code, null);
});

test('una ruta inexistente devuelve 404', async context => {
  const url = await startApi(context);
  const response = await fetch(`${url}/ruta-inexistente`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.status, 'error');
  assert.equal(body.status_detail, 'route_not_found');
  assert.equal(body.authorization_code, null);
});
