import { useState } from 'react'
import type { RegistrationInput } from '../../domain/user'
import { useAuthForm } from '../../hooks/useAuthForm'
import { AuthField } from '../molecules/AuthField'
import { AuthNotice } from '../molecules/AuthNotice'
import { PasswordStrength } from '../molecules/PasswordStrength'
import { PrimaryButton } from '../atoms/PrimaryButton'
import { ClubInformation } from './ClubInformation'

export function RegisterForm({ onRegister }: { onRegister: (input: RegistrationInput) => Promise<void> }) {
  const form = useAuthForm(true)
  const [rulesOpen, setRulesOpen] = useState(false)
  return <>
    <form noValidate className="auth-form" aria-busy={form.pending} onSubmit={event => void form.submit(event, () => onRegister(form.fields))}>
      {form.error && <AuthNotice title="No pudimos crear tu cuenta" message={form.error} onDismiss={form.clearError} />}
      <AuthField name="fullName" label="Nombre completo" value={form.fields.fullName} onChange={value => form.change('fullName', value)} onBlur={() => form.blur('fullName')} placeholder="Tu nombre y apellidos" autoComplete="name" maxLength={100} hint="Así te daremos la bienvenida en la tribuna." error={form.errors.fullName} valid={Boolean(form.touched.fullName && !form.errors.fullName && form.fields.fullName.trim())} disabled={form.pending} />
      <AuthField name="email" label="Correo electrónico" type="email" value={form.fields.email} onChange={value => form.change('email', value)} onBlur={() => form.blur('email')} autoComplete="email" placeholder="tu.nombre@correo.com" maxLength={160} hint="Será tu llave para entrar al club." error={form.errors.email} valid={Boolean(form.touched.email && !form.errors.email && form.fields.email)} disabled={form.pending} />
      <AuthField name="password" label="Contraseña" type="password" value={form.fields.password} onChange={value => form.change('password', value)} onBlur={() => form.blur('password')} autoComplete="new-password" placeholder="Crea una contraseña" maxLength={128} error={form.errors.password} disabled={form.pending} />
      <PasswordStrength password={form.fields.password} />
      <AuthField name="confirmPassword" label="Confirmar contraseña" type="password" value={form.fields.confirmPassword} onChange={value => form.change('confirmPassword', value)} onBlur={() => form.blur('confirmPassword')} autoComplete="new-password" placeholder="Una vez más, sin prisas" maxLength={128} error={form.errors.confirmPassword} disabled={form.pending} />
      <div className={`agreement ${form.errors.accepted ? 'agreement-invalid' : ''}`}><input id="accepted" name="accepted" type="checkbox" checked={form.fields.accepted} onChange={event => form.change('accepted', event.target.checked)} disabled={form.pending} aria-invalid={Boolean(form.errors.accepted)} aria-describedby={form.errors.accepted ? 'accepted-error' : undefined} /><div><label htmlFor="accepted">Entiendo que las carreras y los pagos son simulados.</label> <button type="button" className="text-button" onClick={() => setRulesOpen(true)}>Leer las reglas del club</button></div></div>
      {form.errors.accepted && <p id="accepted-error" className="field-description field-error">{form.errors.accepted}</p>}
      <PrimaryButton pending={form.pending}>Crear mi cuenta de socio</PrimaryButton>
      <p className="form-switch">¿Ya tienes un lugar en la tribuna? <a href="#/login" aria-disabled={form.pending} onClick={event => { if (form.pending) event.preventDefault() }}>Iniciar sesión</a></p>
    </form>
    {rulesOpen && <ClubInformation topic="rules" onClose={() => setRulesOpen(false)} />}
  </>
}
