import type { User } from '../../domain/user'
import { initials } from '../../lib/format'
import { ClubLogo } from '../atoms/ClubLogo'
import { Badge } from '../atoms/Badge'
import { Icon } from '../atoms/Icon'

interface DashboardHeaderProps {
  user: User
  onLogout: () => void
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-width dashboard-header-inner">
          <ClubLogo />
          <span className="tribune-tab">La tribuna</span>
          <Badge>Carreras simuladas</Badge>
        </div>
      </header>
      <div className="dashboard-width member-strip">
        <p><span className="legend-dot won-dot" /><strong>Caracol Club</strong><span className="member-separator">/</span>Tu pabellón de socios</p>
        <div className="member-session">
          <span className="member-avatar" aria-hidden="true">{initials(user.fullName)}</span>
          <div className="member-identity"><strong>{user.fullName}</strong><span>{user.email}</span></div>
          <button type="button" className="logout-button" onClick={onLogout}><Icon name="arrow" />Cerrar sesión</button>
        </div>
      </div>
    </>
  )
}
