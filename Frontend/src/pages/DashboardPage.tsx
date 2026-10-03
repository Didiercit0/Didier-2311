import { useState } from 'react'
import type { User } from '../domain/user'
import { logoutLocal } from '../services/local-auth'
import { DashboardLayout } from '../components/templates/DashboardLayout'
import { BalanceCard } from '../components/organisms/BalanceCard'
import { DashboardStats } from '../components/organisms/DashboardStats'
import { AuthNotice } from '../components/molecules/AuthNotice'
import { Badge } from '../components/atoms/Badge'
import { Icon } from '../components/atoms/Icon'
import { getDashboardStats } from '../domain/dashboard'
import '../dashboard.css'

export function DashboardPage({ user }: { user: User }) {
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

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {error && <AuthNotice title="No pudimos cerrar sesión" message={error} onDismiss={() => setError('')} />}
      <section className="race-day-strip" aria-label="Resumen de la jornada simulada">
        <div className="race-day-title"><span className="race-day-icon"><Icon name="leaf" /></span><div><div><Badge>JORNADA COMPLETADA</Badge><h1>Un día en la pista verde.</h1></div><p>Seis carreras, mucha paciencia y pequeñas victorias.</p></div></div>
        <dl className="race-day-metrics"><div><dt>Disputadas</dt><dd>{stats.raceCount} carreras</dd></div><div><dt>En pista</dt><dd>{stats.snails.length} caracoles</dd></div></dl>
      </section>
      <BalanceCard balance={user.balance} />
      <DashboardStats />
    </DashboardLayout>
  )
}
