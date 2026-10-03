import { useEffect, useRef } from 'react'
import { useTopUpForm } from '../../hooks/useTopUpForm'
import { formatMoney } from '../../lib/format'
import { Icon } from '../atoms/Icon'
import { SnailPayBrand } from '../atoms/SnailPayBrand'
import { PrimaryButton } from '../atoms/PrimaryButton'
import { AuthField } from '../molecules/AuthField'
import { AuthNotice } from '../molecules/AuthNotice'
import { AmountPresets } from '../molecules/AmountPresets'
import { PaymentStateIndicator } from '../molecules/PaymentStateIndicator'
import type { PaymentState } from '../molecules/PaymentStateIndicator'
import '../../top-up.css'

const RESULT_TITLES: Record<Exclude<PaymentState, 'form' | 'loading'>, string> = {
  approved: 'Tu recarga fue aprobada',
  rejected: 'La recarga fue rechazada',
  error: 'No pudimos completar la recarga',
  timeout: 'La pasarela tardó demasiado',
}

export function TopUpDialog({ fullName, onClose }: { fullName: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const notification = useRef<HTMLDivElement>(null)
  const form = useTopUpForm(fullName)
  const amount = Number(form.fields.amount)
  const validAmount = Number.isFinite(amount) && amount > 0 && !form.errors.amount

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal()
  }, [])

  useEffect(() => {
    if (form.result) notification.current?.scrollIntoView({ block: 'nearest' })
  }, [form.result])

  function handleClose() {
    if (!form.pending) onClose()
  }

  return (
    <dialog
      ref={dialog}
      className="information-dialog top-up-dialog"
      aria-labelledby="top-up-title"
      aria-describedby="top-up-description"
      onCancel={event => {
        if (form.pending) event.preventDefault()
        else onClose()
      }}
    >
      <header className="top-up-header">
        <SnailPayBrand />
        <button className="top-up-close" type="button" aria-label="Cerrar recarga" onClick={handleClose} disabled={form.pending}>
          <Icon name="close" />
        </button>
      </header>

      <div className="top-up-body">
        <h2 id="top-up-title">Cargar saldo en tu cuenta</h2>
        <p id="top-up-description">Un impulso a tu monedero para disfrutar de la tribuna.</p>
        <PaymentStateIndicator state={form.state} />
        <div className="simulation-notice"><Icon name="shield" /><p><strong>Pasarela simulada:</strong> usa datos ficticios de demostración. No se debitará dinero real.</p></div>

        <form className="auth-form top-up-form" noValidate autoComplete="off" aria-busy={form.pending} onSubmit={event => void form.submit(event)}>
          {form.pending && <div className="payment-loading" role="status"><span className="button-spinner" aria-hidden="true" />Procesando tu recarga. Espera el resultado de SnailPay.</div>}
          {form.result && (
            <div ref={notification}>
              <AuthNotice
                title={RESULT_TITLES[form.result.outcome]}
                message={`${form.result.message}${form.result.balance !== undefined ? ` Recarga: ${formatMoney(form.lastAmount)}. Saldo disponible: ${formatMoney(form.result.balance)}.` : ''}`}
                kind={form.result.outcome === 'approved' ? 'success' : 'error'}
              />
            </div>
          )}

          <div className="top-up-amount">
            <AmountPresets value={form.fields.amount} onSelect={value => form.change('amount', value)} disabled={form.pending} />
            <AuthField
              name="amount" label="Monto de la recarga (MXN)" icon="money"
              value={form.fields.amount} onChange={value => form.change('amount', value)} onBlur={() => form.blur('amount')}
              placeholder="0.00" autoComplete="off" inputMode="decimal" maxLength={10}
              error={form.errors.amount} disabled={form.pending}
            />
          </div>

          <AuthField
            name="fullName" label="Nombre completo del titular" icon="user"
            value={form.fields.fullName} onChange={value => form.change('fullName', value)} onBlur={() => form.blur('fullName')}
            placeholder="Nombre completo" autoComplete="off" maxLength={100} error={form.errors.fullName} disabled={form.pending}
          />
          <AuthField
            name="cardNumber" label="Número de tarjeta ficticia" icon="card"
            value={form.fields.cardNumber} onChange={value => form.change('cardNumber', value)} onBlur={() => form.blur('cardNumber')}
            placeholder="1234123412341234" autoComplete="off" inputMode="numeric" maxLength={16}
            error={form.errors.cardNumber} disabled={form.pending}
          />
          <div className="payment-field-row">
            <AuthField
              name="expirationDate" label="Fecha de vencimiento" icon="calendar"
              value={form.fields.expirationDate} onChange={value => form.change('expirationDate', value)} onBlur={() => form.blur('expirationDate')}
              placeholder="MM/YY" autoComplete="off" maxLength={5} error={form.errors.expirationDate} disabled={form.pending}
            />
            <AuthField
              name="cvv" label="CVV ficticio" type="password" icon="lock"
              value={form.fields.cvv} onChange={value => form.change('cvv', value)} onBlur={() => form.blur('cvv')}
              placeholder="543" autoComplete="off" inputMode="numeric" maxLength={4} error={form.errors.cvv} disabled={form.pending}
            />
          </div>

          <div className="payment-example">
            <span>Datos de prueba: 1234123412341234 · 12/26 · 543</span>
            <button type="button" className="text-button" onClick={form.useExample} disabled={form.pending}>Usar datos de prueba</button>
          </div>
          <div className="top-up-actions">
            <button type="button" className="top-up-cancel" onClick={handleClose} disabled={form.pending}>
              {form.result?.outcome === 'approved' ? 'Volver al dashboard' : 'Cancelar'}
            </button>
            <PrimaryButton pending={form.pending}>
              {validAmount ? `Recargar ${formatMoney(amount)} MXN` : 'Confirmar recarga'}
            </PrimaryButton>
          </div>
        </form>
      </div>
      <footer className="top-up-footer"><span><Icon name="lock" />Demostración local</span><span>Datos ficticios · Sin cobros reales</span></footer>
    </dialog>
  )
}
