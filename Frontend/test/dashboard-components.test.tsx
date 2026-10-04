import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DashboardPage } from '../src/pages/DashboardPage'
import { BetsChart } from '../src/components/molecules/BetsChart'
import { AmountPresets } from '../src/components/molecules/AmountPresets'
import { TransactionHistory } from '../src/components/organisms/TransactionHistory'
import { loginLocal, registerLocal } from '../src/services/local-auth'
import { credentials, registration } from './fixtures'
import { payment } from './payment-fixtures'

describe('Componentes del dashboard y el historial', () => {
  it('muestra nombre, saldo y ambas gráficas con datos accesibles', () => {
    render(<DashboardPage user={{ id: 'socio-1', fullName: 'Socio visible', email: 'socio@example.com', balance: 37.25 }} />)
    expect(screen.getByText('Socio visible')).toBeVisible()
    expect(within(screen.getByRole('region', { name: 'Saldo disponible' })).getByText('$37.25')).toBeVisible()
    expect(screen.getByRole('img', { name: '30 apuestas: 18 ganadas (60.0%) y 12 perdidas (40.0%).' })).toBeVisible()
    expect(screen.getByRole('img', { name: /Victorias por caracol:/ })).toHaveAttribute('aria-label', expect.stringContaining('Capitán Baba, 0'))
    expect(screen.getAllByRole('row')).toHaveLength(7)
  })

  it('la gráfica maneja cero apuestas sin porcentajes inválidos', () => {
    render(<BetsChart won={0} lost={0} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '0 apuestas: 0 ganadas (0.0%) y 0 perdidas (0.0%).')
  })

  it('los cuatro montos rápidos seleccionan su valor y muestran el activo', async () => {
    const select = vi.fn()
    render(<AmountPresets value="500.00" onSelect={select} disabled={false} />)
    const buttons = within(screen.getByRole('group', { name: 'Montos rápidos de recarga' })).getAllByRole('button')
    expect(buttons).toHaveLength(4)
    expect(buttons[2]).toHaveAttribute('aria-pressed', 'true')
    const user = userEvent.setup()
    for (const button of buttons) await user.click(button)
    expect(select.mock.calls.map(([value]) => value)).toEqual(['100.00', '250.00', '500.00', '1000.00'])
  })

  it('el historial vacío explica dónde aparecerán las recargas', () => {
    render(<TransactionHistory payments={[]} onClose={vi.fn()} />)
    expect(screen.getByText(/Todavía no tienes transacciones/)).toBeVisible()
  })

  it('el historial muestra referencia, monto y resultado, con el más reciente primero', async () => {
    await registerLocal(registration)
    await loginLocal(credentials)
    const close = vi.fn()
    render(<TransactionHistory payments={[payment(), payment({ id: 'pago-2', reference: 'REF-2', status: 'rejected', authorization_code: null })]} onClose={close} />)
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('REF-2')
    expect(rows[1]).toHaveTextContent('Rechazado')
    expect(rows[2]).toHaveTextContent('REF-1')
    expect(rows[2]).toHaveTextContent('$25.50')
    expect(rows[2]).toHaveTextContent('Aprobado')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cerrar historial' }))
    expect(close).toHaveBeenCalledOnce()
  })
})
