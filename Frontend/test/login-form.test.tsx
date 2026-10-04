import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '../src/components/organisms/LoginForm'
import { credentials } from './fixtures'

describe('Formulario de login', () => {
  it('muestra errores y no envía campos vacíos', async () => {
    const login = vi.fn()
    render(<LoginForm initialEmail="" onLogin={login} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Entrar a la tribuna' }))
    expect(screen.getByText('Escribe un correo electrónico válido.')).toBeVisible()
    expect(screen.getByText('Escribe tu contraseña.')).toBeVisible()
    expect(login).not.toHaveBeenCalled()
  })

  it('envía credenciales válidas y ofrece el enlace al registro', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue(undefined)
    render(<LoginForm initialEmail={credentials.email} onLogin={login} />)
    await user.type(screen.getByLabelText('Contraseña'), credentials.password)
    await user.click(screen.getByRole('button', { name: 'Entrar a la tribuna' }))
    expect(login).toHaveBeenCalledExactlyOnceWith(credentials)
    expect(screen.getByRole('link', { name: 'Hazte socio del club' })).toHaveAttribute('href', '#/registro')
  })

  it('muestra el error del servicio y permite descartarlo', async () => {
    const user = userEvent.setup()
    render(<LoginForm initialEmail={credentials.email} onLogin={vi.fn().mockRejectedValue(new Error('Credenciales incorrectas'))} />)
    await user.type(screen.getByLabelText('Contraseña'), credentials.password)
    await user.click(screen.getByRole('button', { name: 'Entrar a la tribuna' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales incorrectas')
    await user.click(screen.getByRole('button', { name: 'Cerrar mensaje' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('bloquea campos y envíos repetidos durante la carga', async () => {
    const user = userEvent.setup()
    let finishLogin = () => {}
    const login = vi.fn(() => new Promise<void>(resolve => { finishLogin = resolve }))
    render(<LoginForm initialEmail={credentials.email} onLogin={login} />)
    await user.type(screen.getByLabelText('Contraseña'), credentials.password)
    await user.click(screen.getByRole('button', { name: 'Entrar a la tribuna' }))
    expect(screen.getByLabelText('Correo electrónico')).toBeDisabled()
    const button = screen.getByRole('button', { name: 'Un momento…' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(login).toHaveBeenCalledOnce()
    await act(async () => { finishLogin() })
    expect(screen.getByRole('button', { name: 'Entrar a la tribuna' })).toBeEnabled()
  })

  it('muestra la confirmación recibida después del registro', () => {
    render(<LoginForm initialEmail="" onLogin={vi.fn()} successMessage="Tu cuenta se creó correctamente." />)
    expect(screen.getByRole('status')).toHaveTextContent('Tu cuenta se creó correctamente.')
  })
})
