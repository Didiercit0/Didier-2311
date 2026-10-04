import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'
import { TopUpDialog } from '../src/components/organisms/TopUpDialog'
import { getCurrentUser, getPaymentHistory, loginLocal, registerLocal } from '../src/services/local-auth'
import { credentials, registration } from './fixtures'
import { jsonResponse, payment } from './payment-fixtures'

async function fillTopUp(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Usar datos de prueba' }))
  await user.type(screen.getByLabelText('Monto de la recarga (MXN)'), '25.50')
}

describe('Integración del modal con dashboard y recarga', () => {
  beforeEach(async () => {
    await registerLocal(registration)
    await loginLocal(credentials)
  })

  it('sin sesión el dashboard no muestra los datos guardados de la cuenta', () => {
    localStorage.removeItem('caracolclub.session.v1')
    window.history.replaceState(null, '', '/#/dashboard')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Entrar a la tribuna' })).toBeVisible()
    expect(screen.queryByText(registration.fullName)).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Saldo disponible' })).not.toBeInTheDocument()
  })

  it('abre y cierra recarga e historial desde el dashboard', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '+ Cargar saldo' }))
    expect(screen.getByRole('dialog', { name: 'Cargar saldo en tu cuenta' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Cerrar recarga' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Historial de transacciones' }))
    expect(screen.getByRole('dialog', { name: 'Historial de transacciones' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Volver al dashboard' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('datos inválidos muestran errores sin llamar al API', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch')
    render(<TopUpDialog fullName={registration.fullName} onClose={vi.fn()} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Confirmar recarga' }))
    expect(screen.getByLabelText('Número de tarjeta ficticia')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Monto de la recarga (MXN)')).toHaveAttribute('aria-invalid', 'true')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('permite elegir un monto rápido y reemplazarlo por uno personalizado', async () => {
    const user = userEvent.setup()
    render(<TopUpDialog fullName={registration.fullName} onClose={vi.fn()} />)
    const presets = within(screen.getByRole('group', { name: 'Montos rápidos de recarga' })).getAllByRole('button')
    await user.click(presets[2])
    const amount = screen.getByLabelText('Monto de la recarga (MXN)')
    expect(amount).toHaveValue('500.00')
    await user.clear(amount)
    await user.type(amount, '37.25')
    expect(amount).toHaveValue('37.25')
    expect(screen.getByRole('button', { name: 'Recargar $37.25 MXN' })).toBeVisible()
  })

  it('una aprobación actualiza el dashboard y aparece en el historial', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(payment()))
    render(<App />)
    await user.click(screen.getByRole('button', { name: '+ Cargar saldo' }))
    await fillTopUp(user)
    await user.click(screen.getByRole('button', { name: 'Recargar $25.50 MXN' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Tu recarga fue aprobada')
    expect(within(screen.getByRole('region', { name: 'Saldo disponible' })).getByText('$25.50')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Volver al dashboard' }))
    await user.click(screen.getByRole('button', { name: 'Historial de transacciones' }))
    expect(within(screen.getByRole('dialog', { name: 'Historial de transacciones' })).getByRole('table')).toHaveTextContent('REF-1')
    expect(within(screen.getByRole('dialog', { name: 'Historial de transacciones' })).getByRole('table')).toHaveTextContent('Aprobado')
    expect(getCurrentUser()?.balance).toBe(25.5)
  })

  it.each([
    [402, 'rejected', 'invalid_cvv', 'La recarga fue rechazada'],
    [503, 'error', 'system_unavailable', 'No pudimos completar la recarga'],
    [504, 'error', 'gateway_timeout', 'La pasarela tardó demasiado'],
  ] as const)('muestra HTTP %s sin incrementar saldo', async (httpStatus, status, detail, title) => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(payment({ status, status_detail: detail, authorization_code: null }), httpStatus))
    render(<TopUpDialog fullName={registration.fullName} onClose={vi.fn()} />)
    await fillTopUp(user)
    await user.click(screen.getByRole('button', { name: 'Recargar $25.50 MXN' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(title)
    expect(getCurrentUser()?.balance).toBe(0)
  })

  it('bloquea campos, cierre y envíos simultáneos mientras procesa', async () => {
    const user = userEvent.setup()
    let finishRequest: (response: Response) => void = () => {}
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(resolve => { finishRequest = resolve }))
    const close = vi.fn()
    render(<TopUpDialog fullName={registration.fullName} onClose={close} />)
    await fillTopUp(user)
    await user.click(screen.getByRole('button', { name: 'Recargar $25.50 MXN' }))
    expect(screen.getByRole('status')).toHaveTextContent('Procesando tu recarga')
    expect(screen.getByLabelText('Monto de la recarga (MXN)')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cerrar recarga' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Un momento…' })).toBeDisabled()
    fireEvent.submit(screen.getByLabelText('Monto de la recarga (MXN)').closest('form')!)
    const cancel = new Event('cancel', { cancelable: true, bubbles: true })
    fireEvent(screen.getByRole('dialog'), cancel)
    expect(cancel.defaultPrevented).toBe(true)
    expect(close).not.toHaveBeenCalled()
    expect(fetcher).toHaveBeenCalledOnce()
    await act(async () => { finishRequest(jsonResponse(payment())) })
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Tu recarga fue aprobada'))
    expect(getPaymentHistory()).toHaveLength(1)
  })
})
