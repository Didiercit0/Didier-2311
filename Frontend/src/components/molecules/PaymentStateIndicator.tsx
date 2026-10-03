export type PaymentState = 'form' | 'loading' | 'approved' | 'rejected' | 'error' | 'timeout'

const STATES: { value: PaymentState; label: string }[] = [
  { value: 'form', label: 'Formulario' },
  { value: 'loading', label: 'Cargando' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'rejected', label: 'Rechazado' },
  { value: 'error', label: 'Error sistema' },
  { value: 'timeout', label: 'Timeout' },
]

export function PaymentStateIndicator({ state }: { state: PaymentState }) {
  return (
    <ol className="payment-states" aria-label="Estado de la recarga">
      {STATES.map(item => (
        <li key={item.value} aria-current={state === item.value ? 'step' : undefined} className={state === item.value ? `payment-state-current state-${state}` : ''}>
          {state === item.value && <span className="payment-state-dot" aria-hidden="true" />}
          {item.label}
        </li>
      ))}
    </ol>
  )
}
