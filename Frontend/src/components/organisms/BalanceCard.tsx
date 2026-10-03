import { formatMoney } from '../../lib/format'
import { Icon } from '../atoms/Icon'

export function BalanceCard({ balance, onTopUp }: { balance: number; onTopUp: () => void }) {
  return (
    <section className="dashboard-card balance-card" aria-label="Saldo disponible">
      <div>
        <p className="eyebrow">SALDO ACTUAL DISPONIBLE <Icon name="lock" /></p>
        <p className="balance-amount" aria-live="polite" aria-atomic="true">{formatMoney(balance)} <span>MXN</span></p>
        <p className="card-description">Tu monedero del club. Pequeñas recargas para grandes momentos en la tribuna.</p>
      </div>
      <div className="balance-actions">
        <button type="button" className="primary-button" onClick={onTopUp}><Icon name="user" />Cargar saldo<Icon name="arrow" /></button>
        <p><Icon name="shield" />Saldo de demostración. Todos los pagos son ficticios.</p>
      </div>
    </section>
  )
}
