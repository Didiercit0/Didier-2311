import { describe, expect, it } from 'vitest'
import { validateAuth } from '../src/lib/validation'
import { registration } from './fixtures'

describe('Validaciones de login y registro', () => {
  it('acepta un registro válido', () => {
    expect(validateAuth(registration, true)).toEqual({})
  })

  it('exige correo y contraseña en login', () => {
    const errors = validateAuth({ ...registration, email: '', password: '' }, false)
    expect(errors.email).toBeDefined()
    expect(errors.password).toBe('Escribe tu contraseña.')
  })

  it('rechaza un correo inválido', () => {
    expect(validateAuth({ ...registration, email: 'sin-arroba' }, false).email).toBeDefined()
  })

  it('exige todos los campos del registro y la aceptación', () => {
    const errors = validateAuth({ fullName: '', email: '', password: '', confirmPassword: '', accepted: false }, true)
    expect(Object.keys(errors).sort()).toEqual(['accepted', 'confirmPassword', 'email', 'fullName', 'password'])
  })

  it('rechaza contraseñas diferentes', () => {
    expect(validateAuth({ ...registration, confirmPassword: 'OtraClave123!' }, true).confirmPassword)
      .toBe('Las contraseñas no coinciden.')
  })

  it('rechaza contraseñas cortas y contraseñas de espacios', () => {
    expect(validateAuth({ ...registration, password: 'corta' }, true).password).toBeDefined()
    expect(validateAuth({ ...registration, password: '        ' }, true).password).toBeDefined()
  })

  it('rechaza campos demasiado largos', () => {
    const errors = validateAuth({ ...registration, fullName: 'a'.repeat(101), email: 'a'.repeat(161) + '@correo.com', password: 'a'.repeat(129) }, true)
    expect(errors.fullName).toBeDefined()
    expect(errors.email).toBeDefined()
    expect(errors.password).toBeDefined()
  })

  it('login no requiere los campos exclusivos de registro', () => {
    expect(validateAuth({ ...registration, fullName: '', confirmPassword: '', accepted: false }, false)).toEqual({})
  })
})
