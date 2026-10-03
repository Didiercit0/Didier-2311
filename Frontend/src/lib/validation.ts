export interface AuthFields { fullName: string; email: string; password: string; confirmPassword: string; accepted: boolean }
export type FieldErrors = Partial<Record<keyof AuthFields, string>>

export function validateAuth(fields: AuthFields, registering: boolean): FieldErrors {
  const errors: FieldErrors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) || fields.email.trim().length > 160) errors.email = 'Escribe un correo electrónico válido.'
  if (!fields.password) errors.password = 'Escribe tu contraseña.'
  if (registering) {
    if (!fields.fullName.trim() || fields.fullName.trim().length > 100) errors.fullName = 'Escribe tu nombre completo (máximo 100 caracteres).'
    if (fields.password.length < 8 || !fields.password.trim()) errors.password = 'Usa al menos 8 caracteres y evita una contraseña de solo espacios.'
    if (fields.password.length > 128) errors.password = 'Usa un máximo de 128 caracteres.'
    if (!fields.confirmPassword) errors.confirmPassword = 'Confirma tu contraseña.'
    else if (fields.confirmPassword !== fields.password) errors.confirmPassword = 'Las contraseñas no coinciden.'
    if (!fields.accepted) errors.accepted = 'Confirma que entiendes las reglas de esta demostración.'
  }
  return errors
}

export function passwordStrength(password: string) {
  if (!password) return { score: 0, label: 'Sin contraseña' }
  if (password.length < 8) return { score: 1, label: 'Muy corta' }
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^\w\s]/].filter(pattern => pattern.test(password)).length
  const score = Math.min(4, Math.max(2, variety))
  return { score, label: score === 4 ? 'Fuerte' : score === 3 ? 'Buena' : 'Mejorable' }
}
