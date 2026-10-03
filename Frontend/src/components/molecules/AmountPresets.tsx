const PRESET_AMOUNTS = [100, 250, 500, 1000] as const
const amountLabel = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

interface AmountPresetsProps {
  value: string
  onSelect: (value: string) => void
  disabled: boolean
}

export function AmountPresets({ value, onSelect, disabled }: AmountPresetsProps) {
  return (
    <div className="amount-presets" role="group" aria-label="Montos rápidos de recarga">
      {PRESET_AMOUNTS.map(amount => (
        <button key={amount} type="button" aria-pressed={Number(value) === amount} onClick={() => onSelect(amount.toFixed(2))} disabled={disabled}>
          {amountLabel.format(amount)}
        </button>
      ))}
    </div>
  )
}
