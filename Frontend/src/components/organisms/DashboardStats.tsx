import { getDashboardStats } from '../../domain/dashboard'
import { Badge } from '../atoms/Badge'
import { DashboardIcon } from '../atoms/DashboardIcon'
import { CardHeading } from '../molecules/CardHeading'
import { BetsChart } from '../molecules/BetsChart'
import { SnailChart } from '../molecules/SnailChart'

export function DashboardStats() {
  const stats = getDashboardStats()
  return <div className="dashboard-stats">
    <section className="dashboard-card bets-card">
      <CardHeading eyebrow="HISTORIAL DE HOY" title="Apuestas ganadas vs. perdidas" description="Desglose de boletos sellados durante la jornada diurna en el recinto." aside={<span className="chart-heading-icon"><DashboardIcon name="chart" /></span>} />
      <BetsChart won={stats.bets.won} lost={stats.bets.lost} />
    </section>
    <section className="dashboard-card races-card" id="snail-statistics">
      <CardHeading eyebrow="ESTADÍSTICA DE PISTA" title="Victorias por caracol – Día de carreras" description="Desempeño acumulado sobre césped húmedo. Altura máxima: 2 victorias reglamentarias." aside={<Badge>{stats.raceCount} Carreras • {stats.raceCount} Victorias</Badge>} />
      <SnailChart snails={stats.snails} />
      <p className="chart-footnote"><span><span className="legend-dot won-dot" />Triunfos certificados por los jueces de línea</span><strong>Total: {stats.raceCount} carreras finalizadas</strong></p>
    </section>
  </div>
}
