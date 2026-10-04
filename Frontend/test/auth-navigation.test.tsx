import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../src/App'
import { LoginPage } from '../src/pages/LoginPage'
import { ACCOUNT_KEY, SESSION_KEY, registerLocal } from '../src/services/local-auth'
import { registration } from './fixtures'
import { fillRegistration } from './form-helpers'

describe('Integración entre páginas, formularios y autenticación local', () => {
  it('permite navegar del login al registro y regresar con los enlaces', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('link', { name: 'Hazte socio del club' }))
    expect(await screen.findByLabelText('Nombre completo')).toBeVisible()
    expect(window.location.hash).toBe('#/registro')
    await user.click(screen.getByRole('link', { name: 'Iniciar sesión' }))
    await waitFor(() => expect(screen.queryByLabelText('Nombre completo')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Entrar a la tribuna' })).toBeVisible()
    expect(window.location.hash).toBe('#/login')
  })

  it('un registro válido crea la cuenta y vuelve al login con confirmación', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('link', { name: 'Hazte socio del club' }))
    await screen.findByLabelText('Nombre completo')
    await fillRegistration(user)
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta de socio' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Tu cuenta se creó correctamente. Inicia sesión para entrar al club.')
    expect(window.location.hash).toBe('#/login')
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue(registration.email)
    expect(JSON.parse(localStorage.getItem(ACCOUNT_KEY)!)).toMatchObject({ balance: 0 })
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('login conecta el formulario con la sesión local y dirige al dashboard', async () => {
    const account = await registerLocal(registration)
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText('Contraseña'), registration.password)
    await user.click(screen.getByRole('button', { name: 'Entrar a la tribuna' }))
    await waitFor(() => expect(window.location.hash).toBe('#/dashboard'))
    expect(localStorage.getItem(SESSION_KEY)).toBe(account.id)
  })
})
