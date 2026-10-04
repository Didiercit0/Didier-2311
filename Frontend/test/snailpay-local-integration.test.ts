import { createRequire } from 'node:module'
import type { Server } from 'node:http'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { topUp } from '../src/services/snailpay'
import { getCurrentUser, getPaymentHistory, loginLocal, registerLocal } from '../src/services/local-auth'
import { credentials, registration } from './fixtures'
import { topUpInput } from './payment-fixtures'

// Se carga el servicio compilado de SnailPay y se realiza HTTP real sin navegador.
const require = createRequire(import.meta.url)
const { createSnailPayApp } = require('../../snailpay/dist/app.js') as {
  createSnailPayApp: (options: { mode: 'normal' | 'system_error' | 'timeout'; timeoutDelayMs: number }) => {
    listen: (port: number, host: string) => Server
  }
}
let server: Server | undefined

async function startApi(mode: 'normal' | 'system_error' | 'timeout' = 'normal') {
  server = createSnailPayApp({ mode, timeoutDelayMs: 30 }).listen(0, '127.0.0.1')
  await new Promise<void>((resolve, reject) => {
    server!.once('listening', resolve)
    server!.once('error', reject)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No se asignó un puerto')
  return `http://127.0.0.1:${address.port}/payments`
}

describe('Frontend conectado a SnailPay local por HTTP', () => {
  beforeEach(async () => {
    await registerLocal(registration)
    await loginLocal(credentials)
  })

  afterEach(async () => {
    if (!server) return
    const activeServer = server
    server = undefined
    activeServer.closeAllConnections()
    await new Promise<void>((resolve, reject) => activeServer.close(error => error ? reject(error) : resolve()))
  })

  it('aprueba dos recargas reales y conserva respuestas ficticias completas', async () => {
    const url = await startApi()
    expect(await topUp(topUpInput, { url })).toMatchObject({ outcome: 'approved', balance: 25.5 })
    expect(await topUp(topUpInput, { url })).toMatchObject({ outcome: 'approved', balance: 51 })
    const history = getPaymentHistory()
    expect(history).toHaveLength(2)
    expect(history[0].id).not.toBe(history[1].id)
    expect(history[0]).toMatchObject({
      card_number: topUpInput.cardNumber, cvv: topUpInput.cvv,
      payer_id: getCurrentUser()!.id, payer_email: registration.email,
    })
    expect(history[0].authorization_code).toMatch(/^TEST-/)
  })

  it('una tarjeta rechazada conserva saldo y registra el rechazo', async () => {
    const url = await startApi()
    const result = await topUp({ ...topUpInput, cardNumber: '4000000000000002' }, { url })
    expect(result.outcome).toBe('rejected')
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()[0]).toMatchObject({ status: 'rejected', authorization_code: null })
  })

  it('el modo system_error conserva saldo y registra el error', async () => {
    const url = await startApi('system_error')
    expect((await topUp(topUpInput, { url })).outcome).toBe('error')
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()[0].status).toBe('error')
  })

  it('el modo timeout devuelve un resultado sin incrementar saldo', async () => {
    const url = await startApi('timeout')
    expect((await topUp(topUpInput, { url, timeoutMs: 1000 })).outcome).toBe('timeout')
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()[0].status_detail).toBe('gateway_timeout')
  })
})
