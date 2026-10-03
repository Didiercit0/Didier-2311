import { useState } from 'react'
import { Icon } from '../atoms/Icon'
import type { IconName } from '../atoms/Icon'

interface Props {
  name: string; label: string; value: string; onChange: (value: string) => void; onBlur: () => void;
  type?: 'text' | 'email' | 'password'; icon?: IconName; placeholder?: string; autoComplete: string;
  error?: string; hint?: string; valid?: boolean; maxLength?: number; disabled?: boolean;
  inputMode?: 'text' | 'numeric' | 'decimal';
}
export function AuthField({ name, label, value, onChange, onBlur, type = 'text', icon, placeholder, autoComplete, error, hint, valid, maxLength, disabled, inputMode }: Props) {
  const [visible, setVisible] = useState(false)
  const description = error || hint
  return <div className={`form-field ${error ? 'field-invalid' : ''}`}>
    <div className="label-line"><label htmlFor={name}>{label}</label>{error && <span className="field-label-note">Revisa este campo</span>}</div>
    <div className={`input-wrap ${icon ? 'with-icon' : ''}`}>
      {icon && <Icon name={icon} className="input-icon" />}
      <input id={name} name={name} type={type === 'password' && visible ? 'text' : type} value={value} onChange={event => onChange(event.target.value)} onBlur={onBlur} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode} maxLength={maxLength} disabled={disabled} required aria-invalid={Boolean(error)} aria-describedby={description ? `${name}-description` : undefined} spellCheck={type === 'email' ? false : undefined} autoCapitalize={type === 'email' ? 'none' : undefined} />
      {type === 'password' ? <button type="button" className="password-toggle" aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)} disabled={disabled}><Icon name={visible ? 'eye-off' : 'eye'} /></button> : error ? <Icon name="alert" className="input-state" /> : valid ? <Icon name="check" className="input-state valid" /> : null}
    </div>
    {description && <p id={`${name}-description`} className={`field-description ${error ? 'field-error' : ''}`}>{error && <Icon name="alert" />}{description}</p>}
  </div>
}
