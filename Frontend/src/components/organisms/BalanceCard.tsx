import { formatMoney } from '../../lib/format'
import { Icon } from '../atoms/Icon'
import { DashboardIcon } from '../atoms/DashboardIcon'

interface BalanceCardProps {
  balance: number
  onTopUp: () => void
  onHistory: () => void
}

export function BalanceCard({ balance, onTopUp, onHistory }: BalanceCardProps) {
  return <section className="dashboard-card balance-card" aria-label="Saldo disponible">
    <div className="balance-summary">
      <p className="eyebrow">SALDO ACTUAL DISPONIBLE <span className="vault-label"><Icon name="lock" />Bóveda Segura Club</span></p>
      <div className="balance-money-row">
        <p className="balance-amount" aria-live="polite" aria-atomic="true">{formatMoney(balance)}</p>
        <span className="balance-currencies" aria-label="Moneda: MXN"><span className="currency-active">MXN</span><span aria-label="USD no disponible">USD</span></span>
      </div>
      <p className="card-description">Monedero regulado de apuestas lentas. Disponible para boletos en tribuna, apuestas al caracol ganador y quinielas de jardín.</p>
    </div>
    <div className="balance-actions">
      <button type="button" className="primary-button" onClick={onTopUp}><DashboardIcon name="wallet" /><span>+ Cargar saldo</span></button>
      <button type="button" className="history-button" onClick={onHistory}><DashboardIcon name="receipt" /><span>Historial de transacciones</span></button>
    </div>
    <span className="balance-watermark" aria-hidden="true">♜</span>
  </section>
}
