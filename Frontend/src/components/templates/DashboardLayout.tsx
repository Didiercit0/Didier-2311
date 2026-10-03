import type { ReactNode } from 'react'
import type { User } from '../../domain/user'
import { DashboardHeader } from '../organisms/DashboardHeader'

interface DashboardLayoutProps {
  user: User
  onLogout: () => void
  children: ReactNode
}

export function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-page">
      <DashboardHeader user={user} onLogout={onLogout} />
      <main className="dashboard-width dashboard-content">{children}</main>
      <footer className="dashboard-footer dashboard-width"><div><strong>Caracol Club</strong><p>La vida se disfruta mejor sin prisas.</p></div><span>Carreras y pagos simulados · Sin dinero real</span></footer>
    </div>
  )
}
