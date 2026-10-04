import type { RegistrationInput } from '../src/domain/user'

export const registration: RegistrationInput = {
  fullName: 'Socio de prueba',
  email: 'socio@example.com',
  password: 'DemoClave123!',
  confirmPassword: 'DemoClave123!',
  accepted: true,
}
export const credentials = { email: registration.email, password: registration.password }
