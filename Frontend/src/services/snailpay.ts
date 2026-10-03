import type { Payment, TopUpInput, TopUpResult } from '../domain/payment'
import { validateTopUp } from '../lib/payment-validation'
import { paymentMessage } from '../lib/payment-messages'
import { getCurrentUser, savePayment } from './local-auth'

const DEFAULT_TIMEOUT_MS = 5000
const DEFAULT_URL = '/snailpay/payments'
let pendingWrite = Promise.resolve()

interface GatewayOptions {
  url?: string
  timeoutMs?: number
  fetcher?: typeof fetch
}

function isPayment(value: unknown): value is Payment {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && Boolean(item.id)
    && ['approved', 'rejected', 'error'].includes(String(item.status))
    && typeof item.status_detail === 'string'
    && typeof item.transaction_amount === 'number' && Number.isFinite(item.transaction_amount)
    && typeof item.date_created === 'string' && Number.isFinite(Date.parse(item.date_created))
    && (item.authorization_code === null || typeof item.authorization_code === 'string')
    && typeof item.reference === 'string' && Boolean(item.reference)
    && typeof item.payer_id === 'string' && typeof item.payer_email === 'string'
    && (item.card_number === null || typeof item.card_number === 'string')
    && (item.cvv === null || typeof item.cvv === 'string')
}

async function serializedWrite(payment: Payment): Promise<number> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('caracolclub:balance', async () => savePayment(payment))
  }
  const operation = pendingWrite.then(() => savePayment(payment))
  pendingWrite = operation.then(() => undefined, () => undefined)
  return operation
}

export async function topUp(input: TopUpInput, options: GatewayOptions = {}): Promise<TopUpResult> {
  const errors = validateTopUp(input)
  if (Object.keys(errors).length) return { outcome: 'error', message: Object.values(errors)[0] ?? 'Revisa los datos.' }
  const user = getCurrentUser()
  if (!user) return { outcome: 'error', message: 'Inicia sesión antes de cargar saldo.' }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  let response: Response
  let value: unknown

  try {
    response = await (options.fetcher ?? fetch)(options.url ?? import.meta.env?.VITE_SNAILPAY_URL ?? DEFAULT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ ...input, fullName: input.fullName.trim(), amount: Number(input.amount), payerId: user.id, payerEmail: user.email }),
    })
    value = await response.json()
  } catch {
    const outcome = controller.signal.aborted ? 'timeout' : 'error'
    return { outcome, message: paymentMessage(outcome) }
  } finally {
    clearTimeout(timer)
  }

  if (!isPayment(value) || value.payer_id !== user.id || value.payer_email !== user.email
    || value.transaction_amount !== Number(input.amount)
    || value.card_number !== input.cardNumber || value.cvv !== input.cvv) {
    return { outcome: 'error', message: 'El servicio de pagos devolvió una respuesta inesperada. Tu saldo no se modificó.' }
  }

  const approved = response.ok && value.status === 'approved' && Boolean(value.authorization_code)
  const rejected = response.status >= 400 && response.status < 500 && value.status === 'rejected'
  const outcome = approved ? 'approved' : rejected ? 'rejected' : value.status_detail === 'gateway_timeout' || response.status === 504 ? 'timeout' : 'error'
  // A contradictory status never becomes an approved payment in storage.
  const payment: Payment = { ...value, status: approved ? 'approved' : rejected ? 'rejected' : 'error' }
  try {
    const balance = await serializedWrite(payment)
    return { outcome, message: paymentMessage(outcome, value.status_detail), ...(approved ? { balance } : {}) }
  } catch (error) {
    return { outcome: 'error', message: error instanceof Error ? error.message : 'No se pudo guardar la recarga.' }
  }
}
