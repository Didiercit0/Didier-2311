import { useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../../domain/user'
import { DashboardHeader } from '../organisms/DashboardHeader'
import { ClubInformation } from '../organisms/ClubInformation'
import type { ClubInformationTopic } from '../organisms/ClubInformation'

interface DashboardLayoutProps {
  user: User
  onLogout: () => void
  children: ReactNode
}

export function DashboardLayout({ user, onLogout, children }: DashboardLayoutProps) {
  const [information, setInformation] = useState<ClubInformationTopic | null>(null)
  return <div className="dashboard-page">
    <DashboardHeader user={user} onLogout={onLogout} onInformation={setInformation} />
    <main className="dashboard-width dashboard-content">{children}</main>
    <footer className="dashboard-footer">
      <div className="dashboard-width dashboard-footer-inner">
        <div><strong>Caracol Club &amp; Lawn Turf</strong><p>Devoted to the dignified art of slow-paced racing since 1904.</p></div>
        <nav aria-label="Información del club">
          <button type="button" onClick={() => setInformation('rules')}>Wagering Conduct</button>
          <button type="button" onClick={() => setInformation('club')}>Stud Registry</button>
          <button type="button" onClick={() => setInformation('rules')}>Botanical Standards</button>
        </nav>
        <span>© 2024 Caracol Club. Gentle wagers only.</span>
      </div>
    </footer>
    {information && <ClubInformation topic={information} onClose={() => setInformation(null)} />}
  </div>
}
