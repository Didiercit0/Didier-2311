import type { User } from '../../domain/user'
import { initials } from '../../lib/format'
import logo from '../../assets/logo.png'
import { Icon } from '../atoms/Icon'
import { DashboardIcon } from '../atoms/DashboardIcon'
import type { ClubInformationTopic } from './ClubInformation'

interface DashboardHeaderProps {
  user: User
  onLogout: () => void
  onInformation: (topic: ClubInformationTopic) => void
}

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ block: 'start' })

export function DashboardHeader({ user, onLogout, onInformation }: DashboardHeaderProps) {
  return <>
    <header className="dashboard-header">
      <div className="dashboard-width dashboard-header-inner">
        <a className="dashboard-brand" href="#/dashboard" aria-label="Caracol Club, dashboard">
          <img src={logo} alt="Caracol Club · Club de Carreras" width="640" height="200" />
        </a>
        <nav className="dashboard-nav" aria-label="Navegación del club">
          <button type="button" className="nav-active" onClick={() => scrollTo('race-day')}>Live Races</button>
          <button type="button" onClick={() => scrollTo('race-results')}>Schedule &amp; Fixtures</button>
          <button type="button" onClick={() => scrollTo('snail-statistics')}>The Stables</button>
          <button type="button" onClick={() => onInformation('rules')}>Club Rules</button>
          <button type="button" onClick={() => onInformation('club')}>Heritage</button>
        </nav>
        <div className="club-purse"><div><span>CLUB PURSE</span><strong aria-live="polite">{user.balance.toFixed(2)} sFL</strong></div><span className="purse-avatar"><Icon name="user" /></span></div>
      </div>
    </header>
    <div className="dashboard-width member-strip">
      <p><span className="legend-dot won-dot" /><strong>Caracol Club</strong><span className="member-separator">/</span>Club de Carreras &amp; Paddock Privado</p>
      <div className="member-session">
        <span className="member-avatar" aria-hidden="true">{initials(user.fullName)}</span>
        <div className="member-identity"><strong>{user.fullName}</strong><span>SOCIO #{user.id.replaceAll('-', '').slice(0, 4).toUpperCase()} • TRIBUNA CENTRAL</span></div>
        <button type="button" className="logout-button" onClick={onLogout}><DashboardIcon name="logout" />Cerrar sesión</button>
      </div>
    </div>
  </>
}
