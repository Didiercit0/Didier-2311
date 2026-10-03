import type { Payment } from '../domain/payment'
import type { LocalAccount, LoginInput, RegistrationInput, User } from '../domain/user'
import { validateAuth } from '../lib/validation'

export const ACCOUNT_KEY = 'caracolclub.account.v1'
export const SESSION_KEY = 'caracolclub.session.v1'
export const SESSION_EVENT = 'caracolclub:session'
const ITERATIONS = 210000

function readAccount(): LocalAccount | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null')
    if (!value || typeof value !== 'object') return null
    const record = value as Record<string, unknown>
    if (record.version !== 1 || typeof record.id !== 'string' || !record.id
      || typeof record.fullName !== 'string' || !record.fullName.trim()
      || typeof record.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)
      || typeof record.balance !== 'number' || !Number.isFinite(record.balance) || record.balance < 0
      || typeof record.salt !== 'string' || !/^[a-f0-9]{32}$/.test(record.salt)
      || typeof record.passwordHash !== 'string' || !/^[a-f0-9]{64}$/.test(record.passwordHash)) return null
    return record as unknown as LocalAccount
  } catch { return null }
}
const publicUser = ({ id, fullName, email, balance }: LocalAccount): User => ({ id, fullName, email, balance })
const notifySession = () => window.dispatchEvent(new Event(SESSION_EVENT))

async function hashPassword(password: string, salt: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('Abre la aplicación desde localhost o una conexión HTTPS para crear tu cuenta.')
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: new TextEncoder().encode(salt) }, key, 256)
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function getCurrentUser(): User | null {
  const account = readAccount()
  try {
    return account && (localStorage.getItem(SESSION_KEY) === account.id || sessionStorage.getItem(SESSION_KEY) === account.id) ? publicUser(account) : null
  } catch { return null }
}
export function getSavedEmail(): string { return readAccount()?.email ?? '' }

export async function registerLocal(input: RegistrationInput): Promise<User> {
  const errors = validateAuth(input, true)
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])
  if (readAccount()) throw new Error('Ya tienes una cuenta en este navegador. Inicia sesión con tus datos.')
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('')
  const account: LocalAccount = {
    version: 1, id: crypto.randomUUID(), fullName: input.fullName.trim(), email: input.email.trim().toLowerCase(),
    balance: 0, salt, passwordHash: await hashPassword(input.password, salt),
  }

  if (readAccount()) throw new Error('Ya existe una cuenta en este navegador. Inicia sesión con tus datos.')
  try { localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account)) }
  catch { throw new Error('No pudimos guardar tu cuenta. Permite el almacenamiento del navegador e intenta de nuevo.') }
  return publicUser(account)
}

export async function loginLocal(input: LoginInput): Promise<User> {
  const account = readAccount()
  if (!account || account.email !== input.email.trim().toLowerCase() || await hashPassword(input.password, account.salt) !== account.passwordHash) {
    throw new Error('Correo electrónico o contraseña incorrectos. Revisa tus datos e intenta de nuevo.')
  }
  try {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    const sessionStore = input.remember ? localStorage : sessionStorage
    sessionStore.setItem(SESSION_KEY, account.id)
  } catch { throw new Error('No pudimos guardar tu sesión. Revisa los permisos de almacenamiento del navegador.') }
  notifySession()
  return publicUser(account)
}

export function logoutLocal(): void {
  try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY) }
  catch { throw new Error('No se pudo cerrar la sesión. Revisa el almacenamiento del navegador.') }
  notifySession()
}

export function savePayment(payment: Payment): number {
  const account = readAccount()
  const user = getCurrentUser()
  if (!account || !user || user.id !== payment.payer_id || user.email !== payment.payer_email) {
    throw new Error('La sesión cambió durante la recarga. Inicia sesión y vuelve a intentarlo.')
  }
  const payments = account.payments ?? []
  if (!Array.isArray(payments)) throw new Error('No se pudo leer el almacenamiento de tu cuenta.')
  const previous = payments.find(item => item.id === payment.id)
  if (previous) {
    if (previous.status !== payment.status || previous.transaction_amount !== payment.transaction_amount) {
      throw new Error('El identificador de la operación ya existe con un resultado diferente. Tu saldo no se modificó.')
    }
    return account.balance
  }
  const amountCents = Math.round(payment.transaction_amount * 100)
  if (!Number.isSafeInteger(amountCents) || amountCents < 1) throw new Error('El monto recibido no es válido.')
  const balanceCents = Math.round(account.balance * 100) + (payment.status === 'approved' ? amountCents : 0)
  if (!Number.isSafeInteger(balanceCents)) throw new Error('El saldo excede el límite permitido.')
  const balance = balanceCents / 100
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ ...account, balance, payments: [...payments, payment] }))
  } catch {
    throw new Error('No pudimos guardar el resultado de la recarga. El saldo local no se modificó; revisa el almacenamiento del navegador.')
  }
  notifySession()
  return balance
}
