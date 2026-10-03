interface BetsChartProps {
  won: number
  lost: number
}

export function BetsChart({ won, lost }: BetsChartProps) {
  const total = won + lost
  const wonPercent = total ? won / total * 100 : 0
  const lostPercent = total ? lost / total * 100 : 0
  return (
    <div className="bets-chart">
      <svg viewBox="0 0 240 240" role="img" aria-label={`${total} apuestas: ${won} ganadas (${wonPercent.toFixed(1)}%) y ${lost} perdidas (${lostPercent.toFixed(1)}%).`}>
        <circle cx="120" cy="120" r="82" fill="none" stroke="var(--orange)" strokeWidth="24" />
        <circle cx="120" cy="120" r="82" fill="none" stroke="var(--forest)" strokeWidth="24" pathLength="100" strokeDasharray={`${wonPercent} 100`} transform="rotate(-90 120 120)" />
        <text x="120" y="119" textAnchor="middle" className="donut-total">{total}</text>
        <text x="120" y="140" textAnchor="middle" className="donut-caption">TOTAL APUESTAS</text>
      </svg>
      <dl className="bets-legend">
        <div><dt><span className="legend-dot won-dot" />{won} Ganadas</dt><dd>{wonPercent.toFixed(1)}%</dd></div>
        <div><dt><span className="legend-dot lost-dot" />{lost} Perdidas</dt><dd>{lostPercent.toFixed(1)}%</dd></div>
        <div className="bets-effectiveness"><dt>Efectividad general</dt><dd>{wonPercent.toFixed(1)}% de aciertos</dd></div>
      </dl>
    </div>
  )
}
