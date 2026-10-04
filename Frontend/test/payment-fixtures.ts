import type { Payment, TopUpInput } from '../src/domain/payment'
import { getCurrentUser } from '../src/services/local-auth'

export const topUpInput: TopUpInput = {
  cardNumber: '1234123412341234',
  expirationDate: '12/26',
  cvv: '543',
  fullName: 'Socio de prueba',
  amount: '25.50',
}

// Cada respuesta pertenece a la cuenta activa y contiene solo datos ficticios.
export function payment(overrides: Partial<Payment> = {}): Payment {
  const user = getCurrentUser()
  if (!user) throw new Error('La prueba debe iniciar sesión primero')
  return {
    id: 'pago-1', status: 'approved', status_detail: 'accredited',
    transaction_amount: 25.5, date_created: '2026-10-03T12:00:00.000Z',
    authorization_code: 'TEST-1234', reference: 'REF-1',
    payer_id: user.id, payer_email: user.email,
    card_number: topUpInput.cardNumber, cvv: topUpInput.cvv,
    ...overrides,
  }
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}
