import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser, getPaymentHistory, loginLocal, registerLocal } from '../src/services/local-auth'
import { topUp } from '../src/services/snailpay'
import { credentials, registration } from './fixtures'
import { jsonResponse, payment, topUpInput } from './payment-fixtures'

describe('Servicio de recarga con API simulada', () => {
  beforeEach(async () => {
    await registerLocal(registration)
    await loginLocal(credentials)
  })

  it('no solicita pagos con campos inválidos', async () => {
    const fetcher = vi.fn()
    const result = await topUp({ ...topUpInput, amount: '0' }, { fetcher })
    expect(result.outcome).toBe('error')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('envía identificador y correo de la sesión activa y persiste la aprobación', async () => {
    const user = getCurrentUser()!
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(payment()))
    const result = await topUp(topUpInput, { fetcher })
    const [url, options] = fetcher.mock.calls[0]
    expect(url).toBe('/snailpay/payments')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toMatchObject({ amount: 25.5, payerId: user.id, payerEmail: user.email })
    expect(result).toMatchObject({ outcome: 'approved', balance: 25.5 })
    expect(getCurrentUser()?.balance).toBe(25.5)
  })

  it.each([
    [402, 'rejected', 'invalid_cvv', 'rejected'],
    [503, 'error', 'system_unavailable', 'error'],
    [504, 'error', 'gateway_timeout', 'timeout'],
  ] as const)('con HTTP %s conserva saldo y guarda el resultado', async (httpStatus, status, detail, outcome) => {
    const response = payment({ status, status_detail: detail, authorization_code: null })
    const result = await topUp(topUpInput, { fetcher: vi.fn().mockResolvedValue(jsonResponse(response, httpStatus)) })
    expect(result.outcome).toBe(outcome)
    expect(result).not.toHaveProperty('balance')
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()).toEqual([response])
  })

  it('un fallo de red conserva saldo y no inventa una transacción', async () => {
    const result = await topUp(topUpInput, { fetcher: vi.fn().mockRejectedValue(new Error('Sin conexión')) })
    expect(result.outcome).toBe('error')
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()).toEqual([])
  })

  it('aborta cuando la solicitud tarda demasiado', async () => {
    const fetcher: typeof fetch = (_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new DOMException('Abortado', 'AbortError')), { once: true })
    })
    const result = await topUp(topUpInput, { fetcher, timeoutMs: 10 })
    expect(result.outcome).toBe('timeout')
    expect(result.message).toContain('tardó demasiado')
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()).toEqual([])
  })

  it('rechaza JSON inesperado sin modificar saldo ni historial', async () => {
    const result = await topUp(topUpInput, { fetcher: vi.fn().mockResolvedValue(jsonResponse({ algo: 'inesperado' })) })
    expect(result.message).toContain('respuesta inesperada')
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()).toEqual([])
  })

  it.each([
    { transaction_amount: 99 },
    { payer_id: 'otra-cuenta' },
    { payer_email: 'otro@example.com' },
    { card_number: 'otra-tarjeta' },
    { cvv: '000' },
  ])('rechaza respuestas que no coinciden con la solicitud: %j', async mismatch => {
    const result = await topUp(topUpInput, { fetcher: vi.fn().mockResolvedValue(jsonResponse(payment(mismatch))) })
    expect(result.outcome).toBe('error')
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()).toEqual([])
  })

  it('un HTTP de error no incrementa saldo aunque el cuerpo diga aprobado', async () => {
    const result = await topUp(topUpInput, { fetcher: vi.fn().mockResolvedValue(jsonResponse(payment(), 503)) })
    expect(result.outcome).toBe('error')
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()[0].status).toBe('error')
  })

  it('procesa escrituras simultáneas sin perder saldo ni duplicar operaciones', async () => {
    const first = payment()
    const second = payment({ id: 'pago-2' })
    const fetcher = vi.fn()
      .mockResolvedValueOnce(jsonResponse(first))
      .mockResolvedValueOnce(jsonResponse(second))
      .mockResolvedValueOnce(jsonResponse(first))
    await Promise.all([
      topUp(topUpInput, { fetcher }), topUp(topUpInput, { fetcher }), topUp(topUpInput, { fetcher }),
    ])
    expect(getCurrentUser()?.balance).toBe(51)
    expect(getPaymentHistory()).toHaveLength(2)
  })

  it('si falla la escritura informa el error y conserva el saldo anterior', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Bloqueado') })
    const result = await topUp(topUpInput, { fetcher: vi.fn().mockResolvedValue(jsonResponse(payment())) })
    expect(result.outcome).toBe('error')
    expect(result.message).toContain('No pudimos guardar')
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()).toEqual([])
  })
})
