import { describe, expect, it } from 'vitest'
import { validateTopUp } from '../src/lib/payment-validation'
import { paymentMessage } from '../src/lib/payment-messages'
import { topUpInput } from './payment-fixtures'

describe('Validaciones y mensajes de recarga', () => {
  it('acepta datos ficticios válidos y un monto personalizado', () => {
    expect(validateTopUp(topUpInput)).toEqual({})
    expect(validateTopUp({ ...topUpInput, amount: '37.25' })).toEqual({})
  })

  it('exige todos los campos', () => {
    expect(Object.keys(validateTopUp({ cardNumber: '', expirationDate: '', cvv: '', fullName: '', amount: '' })).sort())
      .toEqual(['amount', 'cardNumber', 'cvv', 'expirationDate', 'fullName'])
  })

  it.each(['0', '-1', '1.001', '100001', 'abc', '1e2'])('rechaza el monto inválido %s', amount => {
    expect(validateTopUp({ ...topUpInput, amount }).amount).toBeDefined()
  })

  it('rechaza tarjeta corta, fecha inválida, CVV corto y nombre vacío', () => {
    const errors = validateTopUp({ ...topUpInput, cardNumber: '1234', expirationDate: '13/26', cvv: '12', fullName: ' ' })
    expect(errors.cardNumber).toBeDefined()
    expect(errors.expirationDate).toBeDefined()
    expect(errors.cvv).toBeDefined()
    expect(errors.fullName).toBeDefined()
  })

  it('permite montos límite y CVV de cuatro dígitos', () => {
    expect(validateTopUp({ ...topUpInput, amount: '0.01', cvv: '1234' })).toEqual({})
    expect(validateTopUp({ ...topUpInput, amount: '100000' })).toEqual({})
  })

  it('explica aprobación, rechazo, error y timeout', () => {
    expect(paymentMessage('approved')).toContain('Recarga aprobada')
    expect(paymentMessage('rejected', 'invalid_cvv')).toContain('CVV')
    expect(paymentMessage('rejected', 'insufficient_funds')).toContain('fondos suficientes')
    expect(paymentMessage('rejected', 'desconocido')).toContain('rechazada')
    expect(paymentMessage('error')).toBe('El servicio de pagos no está disponible por ahora.')
    expect(paymentMessage('timeout')).toBe('El servicio de pagos tardó demasiado. Intenta de nuevo.')
  })
})
