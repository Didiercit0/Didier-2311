import { useState } from 'react'
import type { LoginInput } from '../../domain/user'
import { useAuthForm } from '../../hooks/useAuthForm'
import { AuthField } from '../molecules/AuthField'
import { AuthNotice } from '../molecules/AuthNotice'
import { PrimaryButton } from '../atoms/PrimaryButton'

interface LoginFormProps {
  showRegistrationLink?: boolean
  initialEmail: string
  onLogin: (input: LoginInput) => Promise<void>
  successMessage?: string
}

export function LoginForm({ initialEmail, onLogin, successMessage, showRegistrationLink = true }: LoginFormProps) {
  const form = useAuthForm(false, initialEmail)
  const [remember, setRemember] = useState(true)
  return <form noValidate className="auth-form" aria-busy={form.pending} onSubmit={event => void form.submit(event, () => onLogin({ email: form.fields.email, password: form.fields.password, remember }))}>
    {successMessage && !form.error && <AuthNotice title="Todo listo" message={successMessage} kind="success" />}
    {form.error && <AuthNotice title="No pudimos iniciar sesión" message={form.error} onDismiss={form.clearError} />}
    <AuthField name="email" label="Correo electrónico" type="email" icon="mail" value={form.fields.email} onChange={value => form.change('email', value)} onBlur={() => form.blur('email')} autoComplete="email" placeholder="tu.nombre@correo.com" maxLength={160} error={form.errors.email} disabled={form.pending} />
    <AuthField name="password" label="Contraseña" type="password" icon="lock" value={form.fields.password} onChange={value => form.change('password', value)} onBlur={() => form.blur('password')} autoComplete="current-password" placeholder="Tu contraseña" maxLength={128} error={form.errors.password} disabled={form.pending} />
    <label className="checkbox-label"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} disabled={form.pending} /><span>Recordar mi sesión en este dispositivo</span></label>
    <PrimaryButton pending={form.pending}>Entrar a la tribuna</PrimaryButton>
    {showRegistrationLink && <><div className="form-divider"><span /><b>A TU PROPIO RITMO</b><span /></div>
    <p className="form-switch">¿Primera vez por aquí? <a href="#/registro" aria-disabled={form.pending} onClick={event => { if (form.pending) event.preventDefault() }}>Hazte socio del club</a></p></>}
  </form>
}
