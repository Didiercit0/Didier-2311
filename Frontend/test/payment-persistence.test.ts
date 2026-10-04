import { beforeEach, describe, expect, it } from 'vitest'
import { ACCOUNT_KEY, getCurrentUser, getPaymentHistory, loginLocal, logoutLocal, registerLocal, savePayment } from '../src/services/local-auth'
import { credentials, registration } from './fixtures'
import { payment } from './payment-fixtures'

describe('Persistencia de saldo y pagos', () => {
  beforeEach(async () => {
    await registerLocal(registration)
    await loginLocal(credentials)
  })

  it('una aprobación incrementa exactamente el monto y guarda todos los campos', () => {
    const response = payment()
    expect(savePayment(response)).toBe(25.5)
    const account = JSON.parse(localStorage.getItem(ACCOUNT_KEY)!)
    expect(account.balance).toBe(25.5)
    expect(account.payments).toEqual([response])
    expect(account.payments[0]).toMatchObject({ card_number: '1234123412341234', cvv: '543' })
  })

  it('dos pagos diferentes se acumulan sin errores de coma flotante', () => {
    savePayment(payment({ transaction_amount: 0.1 }))
    savePayment(payment({ id: 'pago-2', transaction_amount: 0.2 }))
    expect(getCurrentUser()?.balance).toBe(0.3)
    expect(getPaymentHistory()).toHaveLength(2)
  })

  it('la misma operación no se aplica dos veces', () => {
    const response = payment()
    savePayment(response)
    expect(savePayment(response)).toBe(25.5)
    expect(getPaymentHistory()).toEqual([response])
  })

  it('rechaza un identificador repetido con un monto diferente', () => {
    savePayment(payment())
    expect(() => savePayment(payment({ transaction_amount: 50 }))).toThrow('ya existe')
    expect(getCurrentUser()?.balance).toBe(25.5)
    expect(getPaymentHistory()).toHaveLength(1)
  })

  it.each(['rejected', 'error'] as const)('guarda %s conservando el saldo', status => {
    savePayment(payment({ status, authorization_code: null }))
    expect(getCurrentUser()?.balance).toBe(0)
    expect(getPaymentHistory()[0].status).toBe(status)
  })

  it('no permite guardar una operación de otro usuario', () => {
    expect(() => savePayment(payment({ payer_id: 'otro' }))).toThrow('La sesión cambió')
    expect(getPaymentHistory()).toEqual([])
    expect(getCurrentUser()?.balance).toBe(0)
  })

  it('recupera el historial de LocalStorage y lo oculta al cerrar sesión', () => {
    const response = payment()
    savePayment(response)
    expect(getPaymentHistory()).toEqual([response])
    logoutLocal()
    expect(getPaymentHistory()).toEqual([])
  })

  it('ignora registros inválidos del historial', () => {
    const account = JSON.parse(localStorage.getItem(ACCOUNT_KEY)!)
    account.payments = [null, { id: 'incompleto' }, payment()]
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account))
    expect(getPaymentHistory()).toHaveLength(1)
  })
})
