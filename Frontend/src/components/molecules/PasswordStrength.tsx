import { passwordStrength } from '../../lib/validation'
import { Icon } from '../atoms/Icon'

export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = passwordStrength(password)
  return <div className="password-strength">
    <div className="strength-bars" role="meter" aria-label="Fortaleza orientativa de la contraseña" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score} aria-valuetext={label}>
      {[1, 2, 3, 4].map(level => <span key={level} className={level <= score ? `strength-active strength-${score}` : ''} />)}
    </div>
    <p><Icon name="shield" /><span>{password ? <><strong>Fuerza de contraseña: {label}.</strong> </> : <strong>Una buena contraseña es tu mejor aliada. </strong>}Usa al menos 8 caracteres; combina letras, números y símbolos.</span></p>
  </div>
}
