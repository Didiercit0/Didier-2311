import { useEffect, useRef } from 'react'
import type { Payment } from '../../domain/payment'
import { formatMoney } from '../../lib/format'
import { Icon } from '../atoms/Icon'

const STATUS_LABELS = { approved: 'Aprobado', rejected: 'Rechazado', error: 'Error' } as const

export function TransactionHistory({ payments, onClose }: { payments: readonly Payment[]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (dialog.current && !dialog.current.open) dialog.current.showModal() }, [])
  return <dialog ref={dialog} className="information-dialog transaction-dialog" onCancel={onClose} aria-labelledby="transaction-title">
    <div className="information-heading"><span className="eyebrow">MONEDERO DEL CLUB</span><button type="button" onClick={onClose} aria-label="Cerrar historial"><Icon name="close" /></button></div>
    <h2 id="transaction-title">Historial de transacciones</h2>
    {payments.length ? <div className="table-scroll"><table className="transaction-table">
      <thead><tr><th scope="col">Fecha</th><th scope="col">Referencia</th><th scope="col">Monto</th><th scope="col">Resultado</th></tr></thead>
      <tbody>{[...payments].reverse().map(payment => <tr key={payment.id}>
        <td>{new Date(payment.date_created).toLocaleString('es-MX')}</td><td>{payment.reference}</td>
        <td>{formatMoney(payment.transaction_amount)}</td><td>{STATUS_LABELS[payment.status]}</td>
      </tr>)}</tbody>
    </table></div> : <p>Todavía no tienes transacciones. Tus recargas aparecerán aquí.</p>}
    <button type="button" className="secondary-button" onClick={onClose}>Volver al dashboard</button>
  </dialog>
}
