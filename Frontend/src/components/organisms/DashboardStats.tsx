import { getDashboardStats } from '../../domain/dashboard'
import { Badge } from '../atoms/Badge'
import { CardHeading } from '../molecules/CardHeading'
import { BetsChart } from '../molecules/BetsChart'
import { SnailChart } from '../molecules/SnailChart'

export function DashboardStats() {
  const stats = getDashboardStats()
  return (
    <div className="dashboard-stats">
      <section className="dashboard-card bets-card">
        <CardHeading eyebrow="HISTORIAL DEL DÍA" title="Apuestas ganadas vs. perdidas" description="Una jornada de pequeñas victorias. Datos simulados." />
        <BetsChart won={stats.bets.won} lost={stats.bets.lost} />
      </section>
      <section className="dashboard-card races-card">
        <CardHeading eyebrow="ESTADÍSTICA DE PISTA" title="Victorias por caracol" description="Seis protagonistas y un día de carreras a su propio ritmo." aside={<Badge>{stats.raceCount} carreras</Badge>} />
        <SnailChart snails={stats.snails} />
        <p className="chart-footnote"><span><span className="legend-dot won-dot" />Victorias del día simulado</span><strong>Total: {stats.raceCount} carreras finalizadas</strong></p>
      </section>
    </div>
  )
}
