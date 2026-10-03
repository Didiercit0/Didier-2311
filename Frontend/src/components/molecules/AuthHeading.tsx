import { ClubLogo } from '../atoms/ClubLogo'

export function AuthHeading({ registering = false }: { registering?: boolean }) {
  return <header className="auth-heading">
    <ClubLogo />
    <div className="club-ornament" aria-hidden="true"><span /><b>✦</b><span /></div>
    <p className="eyebrow">{registering ? 'REGISTRO OFICIAL DE SOCIOS' : 'EL PABELLÓN DE SOCIOS'}</p>
    <h1>{registering ? 'Un lugar en el club.' : 'Qué gusto verte de nuevo.'}</h1>
    <p className="heading-description">{registering ? 'Únete a la afición más tranquila del mundo. Aquí, las buenas cosas van a su propio ritmo.' : 'La tribuna te espera. Entra y disfruta de las carreras sin ninguna prisa.'}</p>
  </header>
}
