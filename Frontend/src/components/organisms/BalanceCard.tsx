import { formatMoney } from '../../lib/format'
import { Icon } from '../atoms/Icon'

export function BalanceCard({ balance, onTopUp }: { balance: number; onTopUp?: () => void }) {
  return (
    <section className="dashboard-card balance-card" aria-label="Saldo disponible">
      <div>
        <p className="eyebrow">SALDO ACTUAL DISPONIBLE <Icon name="lock" /></p>
        <p className="balance-amount" aria-live="polite" aria-atomic="true">{formatMoney(balance)} <span>MXN</span></p>
        <p className="card-description">Tu monedero del club. Pequeñas recargas para grandes momentos en la tribuna.</p>
      </div>
      <div className="balance-actions">
        <button type="button" className="primary-button" onClick={onTopUp} disabled={!onTopUp} aria-describedby="balance-payment-note"><Icon name="user" />Cargar saldo<Icon name="arrow" /></button>
        <p id="balance-payment-note"><Icon name="shield" />{onTopUp ? "Saldo de demostración. Todos los pagos son ficticios." : "Recargas pendientes de integrar."}</p>
      </div>
    </section>
  )
}
