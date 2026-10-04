import type { TopUpInput } from '../domain/payment'

export type PaymentErrors = Partial<Record<keyof TopUpInput, string>>

export function validateTopUp(input: TopUpInput): PaymentErrors {
  const errors: PaymentErrors = {}
  if (!/^\d{16}$/.test(input.cardNumber)) errors.cardNumber = 'Escribe los 16 dígitos de una tarjeta ficticia.'
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(input.expirationDate)) errors.expirationDate = 'Usa el formato MM/YY, por ejemplo 12/26.'
  if (!/^\d{3,4}$/.test(input.cvv)) errors.cvv = 'Escribe un CVV ficticio de 3 o 4 dígitos.'
  if (!input.fullName.trim() || input.fullName.trim().length > 100) errors.fullName = 'Escribe el nombre del titular (máximo 100 caracteres).'
  if (!/^\d+(\.\d{1,2})?$/.test(input.amount) || Number(input.amount) < 0.01 || Number(input.amount) > 100_000) {
    errors.amount = 'Usa un monto entre $0.01 y $100,000 con máximo 2 decimales.'
  }
  return errors
}
