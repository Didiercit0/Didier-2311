import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthHeading } from '../molecules/AuthHeading'
import { ClubInformation } from '../organisms/ClubInformation'
import type { ClubInformationTopic } from '../organisms/ClubInformation'
import { Icon } from '../atoms/Icon'

export function AuthLayout({ children, registering = false }: { children: ReactNode; registering?: boolean }) {
  const [information, setInformation] = useState<ClubInformationTopic | null>(null)
  return <main className={`auth-page ${registering ? 'register-page' : 'login-page'}`}>
    <div className="auth-container">
      {registering && <AuthHeading registering />}
      <section className="auth-card" aria-label={registering ? 'Crear cuenta de socio' : 'Iniciar sesión'}>
        {!registering && <AuthHeading />}{children}
      </section>
      {registering && <div className="club-promise"><Icon name="leaf" /><strong>PEQUEÑOS PASOS, GRANDES MOMENTOS</strong><span>Una experiencia de carreras completamente simulada.</span></div>}
      <footer className="auth-footer"><button type="button" onClick={() => setInformation('club')}>El club</button><span aria-hidden="true">·</span><button type="button" onClick={() => setInformation('rules')}>Las reglas de la pista</button><span aria-hidden="true">·</span><button type="button" onClick={() => setInformation('privacy')}>Tu privacidad</button></footer>
    </div>
    {information && <ClubInformation topic={information} onClose={() => setInformation(null)} />}
  </main>
}
