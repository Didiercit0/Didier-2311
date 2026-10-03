import { useState } from 'react'
import type { User } from '../domain/user'
import { getPaymentHistory, logoutLocal } from '../services/local-auth'
import { DashboardLayout } from '../components/templates/DashboardLayout'
import { BalanceCard } from '../components/organisms/BalanceCard'
import { DashboardStats } from '../components/organisms/DashboardStats'
import { RaceResults } from '../components/organisms/RaceResults'
import { TransactionHistory } from '../components/organisms/TransactionHistory'
import { TopUpDialog } from '../components/organisms/TopUpDialog'
import { AuthNotice } from '../components/molecules/AuthNotice'
import { Badge } from '../components/atoms/Badge'
import { DashboardIcon } from '../components/atoms/DashboardIcon'
import { getDashboardStats } from '../domain/dashboard'
import '../dashboard.css'

export function DashboardPage({ user }: { user: User }) {
  const [modal, setModal] = useState<'top-up' | 'history' | null>(null)
  const [error, setError] = useState('')
  const stats = getDashboardStats()

  function handleLogout() {
    try {
      logoutLocal()
      window.location.hash = '/login'
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'No se pudo cerrar la sesión.')
    }
  }

  return <DashboardLayout user={user} onLogout={handleLogout}>
    {error && <AuthNotice title="No pudimos cerrar sesión" message={error} onDismiss={() => setError('')} />}
    <section className="race-day-strip" id="race-day" aria-label="Resumen de la jornada simulada">
      <div className="race-day-title"><span className="race-day-icon"><DashboardIcon name="garden" /></span><div><div><Badge>EN MARCHA</Badge><h1>Jornada de Primavera – Pista Verde</h1></div><p>Lawn turf natural • Humedad de hierba: 74% óptima • Ambiente plácido</p></div></div>
      <dl className="race-day-metrics">
        <div><dt>Disputadas</dt><dd>{stats.raceCount} carreras</dd></div>
        <div><dt>En pista</dt><dd>{stats.snails.length} caracoles</dd></div>
        <div className="next-race"><dt>Próxima salida</dt><dd><DashboardIcon name="clock" />16:30 hrs</dd></div>
      </dl>
    </section>
    <BalanceCard balance={user.balance} onTopUp={() => setModal('top-up')} onHistory={() => setModal('history')} />
    <DashboardStats />
    <RaceResults />
    {modal === 'top-up' && <TopUpDialog fullName={user.fullName} onClose={() => setModal(null)} />}
    {modal === 'history' && <TransactionHistory payments={getPaymentHistory()} onClose={() => setModal(null)} />}
  </DashboardLayout>
}
