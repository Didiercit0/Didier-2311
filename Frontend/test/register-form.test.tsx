import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RegisterForm } from '../src/components/organisms/RegisterForm'
import { registration } from './fixtures'
import { fillRegistration } from './form-helpers'

describe('Formulario de registro', () => {
  it('no envía campos obligatorios vacíos', async () => {
    const register = vi.fn()
    render(<RegisterForm onRegister={register} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Crear mi cuenta de socio' }))
    expect(screen.getByLabelText('Nombre completo')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Confirmar contraseña')).toHaveAccessibleDescription('Confirma tu contraseña.')
    expect(register).not.toHaveBeenCalled()
  })

  it('muestra contraseñas diferentes y bloquea el registro', async () => {
    const user = userEvent.setup()
    const register = vi.fn()
    render(<RegisterForm onRegister={register} />)
    await fillRegistration(user, 'OtraClave123!')
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta de socio' }))
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeVisible()
    expect(register).not.toHaveBeenCalled()
  })

  it('envía los datos válidos al callback de registro', async () => {
    const user = userEvent.setup()
    const register = vi.fn().mockResolvedValue(undefined)
    render(<RegisterForm onRegister={register} />)
    await fillRegistration(user)
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta de socio' }))
    expect(register).toHaveBeenCalledExactlyOnceWith(registration)
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '#/login')
  })

  it('muestra un error comprensible cuando el servicio rechaza el registro', async () => {
    const user = userEvent.setup()
    render(<RegisterForm onRegister={vi.fn().mockRejectedValue(new Error('Ya tienes una cuenta'))} />)
    await fillRegistration(user)
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta de socio' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya tienes una cuenta')
  })
})
