import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AuthField } from '../src/components/molecules/AuthField'
import { AuthNotice } from '../src/components/molecules/AuthNotice'
import { PrimaryButton } from '../src/components/atoms/PrimaryButton'

describe('Componentes de autenticación', () => {
  it('asocia el campo con su etiqueta, error y callbacks', () => {
    const change = vi.fn()
    const blur = vi.fn()
    render(<AuthField name="email" label="Correo" value="" autoComplete="email" error="Correo inválido" onChange={change} onBlur={blur} />)
    const input = screen.getByLabelText('Correo')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Correo inválido')
    fireEvent.change(input, { target: { value: 'socio@example.com' } })
    fireEvent.blur(input)
    expect(change).toHaveBeenCalledWith('socio@example.com')
    expect(blur).toHaveBeenCalledOnce()
  })

  it('permite mostrar y ocultar la contraseña', async () => {
    const user = userEvent.setup()
    render(<AuthField name="password" label="Contraseña" type="password" value="secreto" autoComplete="current-password" onChange={vi.fn()} onBlur={vi.fn()} />)
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text')
    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
  })

  it('deshabilita el campo y su control de contraseña', () => {
    render(<AuthField name="password" label="Contraseña" type="password" value="" autoComplete="current-password" disabled onChange={vi.fn()} onBlur={vi.fn()} />)
    expect(screen.getByLabelText('Contraseña')).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('muestra un error accesible y permite cerrarlo', async () => {
    const close = vi.fn()
    render(<AuthNotice title="Error" message="Credenciales incorrectas" onDismiss={close} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales incorrectas')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cerrar mensaje' }))
    expect(close).toHaveBeenCalledOnce()
  })

  it('anuncia la confirmación como estado', () => {
    render(<AuthNotice title="Todo listo" message="Cuenta creada" kind="success" />)
    expect(screen.getByRole('status')).toHaveTextContent('Cuenta creada')
  })

  it('muestra el estado de carga y bloquea el botón', () => {
    const { rerender } = render(<PrimaryButton>Entrar</PrimaryButton>)
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled()
    rerender(<PrimaryButton pending>Entrar</PrimaryButton>)
    expect(screen.getByRole('button', { name: 'Un momento…' })).toBeDisabled()
  })
})
