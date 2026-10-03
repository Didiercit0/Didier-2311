interface SnailChartProps {
  snails: readonly { name: string; wins: number }[]
}

export function SnailChart({ snails }: SnailChartProps) {
  const max = Math.max(1, ...snails.map(snail => snail.wins))
  const ticks = Array.from({ length: max + 1 }, (_, index) => max - index)
  return (
    <div className="snail-chart" role="img" aria-label={`Victorias por caracol: ${snails.map(snail => `${snail.name}, ${snail.wins}`).join('; ')}.`}>
      <div className="chart-plot" aria-hidden="true">
        <div className="chart-grid">
          {ticks.map(tick => <div key={tick} className="chart-gridline" style={{ top: `${(max - tick) / max * 100}%` }}><span>{tick}</span></div>)}
        </div>
        <div className="chart-columns">
          {snails.map(snail => (
            <div className="chart-column" key={snail.name}>
              <div className={`snail-bar ${snail.wins === 0 ? 'zero-bar' : ''}`} style={{ height: `${snail.wins / max * 100}%` }}>
                <span>{snail.wins}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-labels" aria-hidden="true">
        {snails.map(snail => <div key={snail.name}><strong>{snail.name}</strong><span>{snail.wins} {snail.wins === 1 ? 'victoria' : 'victorias'}</span></div>)}
      </div>
    </div>
  )
}
