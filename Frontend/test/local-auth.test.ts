import { describe, expect, it, vi } from 'vitest'
import {
  ACCOUNT_KEY, SESSION_KEY, getCurrentUser, getSavedEmail,
  loginLocal, logoutLocal, registerLocal,
} from '../src/services/local-auth'
import { credentials, registration } from './fixtures'

describe('Autenticación local con almacenamiento real de jsdom', () => {
  it('registra una cuenta con saldo cero y sin iniciar sesión', async () => {
    const user = await registerLocal(registration)
    expect(user).toMatchObject({ fullName: registration.fullName, email: registration.email, balance: 0 })
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('guarda hash y salt, sin contraseña ni confirmación originales', async () => {
    await registerLocal(registration)
    const stored = localStorage.getItem(ACCOUNT_KEY)!
    const account = JSON.parse(stored)
    expect(account.salt).toMatch(/^[a-f0-9]{32}$/)
    expect(account.passwordHash).toMatch(/^[a-f0-9]{64}$/)
    expect(account).not.toHaveProperty('password')
    expect(account).not.toHaveProperty('confirmPassword')
    expect(stored).not.toContain(registration.password)
  })

  it('genera un salt y un hash distintos aunque la contraseña sea igual', async () => {
    await registerLocal(registration)
    const first = JSON.parse(localStorage.getItem(ACCOUNT_KEY)!)
    localStorage.clear()
    await registerLocal(registration)
    const second = JSON.parse(localStorage.getItem(ACCOUNT_KEY)!)
    expect(second.salt).not.toBe(first.salt)
    expect(second.passwordHash).not.toBe(first.passwordHash)
  })

  it('no crea una cuenta si los datos son inválidos', async () => {
    await expect(registerLocal({ ...registration, confirmPassword: 'otra' })).rejects.toThrow('no coinciden')
    expect(localStorage.getItem(ACCOUNT_KEY)).toBeNull()
  })

  it('rechaza cuentas duplicadas y conserva la primera', async () => {
    await registerLocal(registration)
    const original = localStorage.getItem(ACCOUNT_KEY)
    await expect(registerLocal(registration)).rejects.toThrow('Ya tienes una cuenta')
    expect(localStorage.getItem(ACCOUNT_KEY)).toBe(original)
  })

  it('rechaza una contraseña incorrecta sin crear sesión', async () => {
    await registerLocal(registration)
    await expect(loginLocal({ ...credentials, password: 'incorrecta' })).rejects.toThrow('incorrectos')
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('rechaza un correo desconocido sin crear sesión', async () => {
    await registerLocal(registration)
    await expect(loginLocal({ ...credentials, email: 'otro@example.com' })).rejects.toThrow('incorrectos')
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('un login correcto guarda la sesión en LocalStorage', async () => {
    const account = await registerLocal(registration)
    const user = await loginLocal(credentials)
    expect(user).toEqual(account)
    expect(localStorage.getItem(SESSION_KEY)).toBe(account.id)
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    expect(getCurrentUser()).toEqual(account)
  })

  it('recupera cuenta y sesión al cargar nuevamente el servicio', async () => {
    const account = await registerLocal(registration)
    await loginLocal(credentials)
    vi.resetModules()
    const reloaded = await import('../src/services/local-auth')
    expect(reloaded.getSavedEmail()).toBe(registration.email)
    expect(reloaded.getCurrentUser()).toEqual(account)
  })

  it('cerrar sesión conserva la cuenta y permite iniciar de nuevo', async () => {
    await registerLocal(registration)
    await loginLocal(credentials)
    const original = localStorage.getItem(ACCOUNT_KEY)
    logoutLocal()
    expect(getCurrentUser()).toBeNull()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
    expect(localStorage.getItem(ACCOUNT_KEY)).toBe(original)
    await expect(loginLocal(credentials)).resolves.toMatchObject({ email: registration.email })
  })

  it('maneja JSON inválido sin romper la lectura y rechaza el login', async () => {
    localStorage.setItem(ACCOUNT_KEY, '{incorrecto')
    expect(getCurrentUser()).toBeNull()
    expect(getSavedEmail()).toBe('')
    await expect(loginLocal(credentials)).rejects.toThrow('incorrectos')
  })

  it('ignora una cuenta incompleta y una sesión ajena', async () => {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ email: registration.email }))
    expect(getSavedEmail()).toBe('')
    await registerLocal(registration)
    localStorage.setItem(SESSION_KEY, 'otro-usuario')
    expect(getCurrentUser()).toBeNull()
  })

  it('maneja almacenamiento que no permite lecturas', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Bloqueado') })
    expect(getCurrentUser()).toBeNull()
    expect(getSavedEmail()).toBe('')
  })

  it('explica que no pudo guardar la cuenta si las escrituras están bloqueadas', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Bloqueado') })
    await expect(registerLocal(registration)).rejects.toThrow('No pudimos guardar tu cuenta')
    expect(localStorage.getItem(ACCOUNT_KEY)).toBeNull()
  })

  it('no crea sesión si el almacenamiento bloquea su escritura', async () => {
    await registerLocal(registration)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Bloqueado') })
    await expect(loginLocal(credentials)).rejects.toThrow('No pudimos guardar tu sesión')
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('informa si no puede eliminar la sesión', async () => {
    await registerLocal(registration)
    await loginLocal(credentials)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('Bloqueado') })
    expect(() => logoutLocal()).toThrow('No se pudo cerrar la sesión')
    expect(getCurrentUser()).not.toBeNull()
  })
})
