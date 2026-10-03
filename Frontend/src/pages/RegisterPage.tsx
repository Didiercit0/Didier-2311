import { AuthLayout } from '../components/templates/AuthLayout'
import { RegisterForm } from '../components/organisms/RegisterForm'
import { registerLocal } from '../services/local-auth'
import type { RegistrationInput } from '../domain/user'

export function RegisterPage({ onRegistered }: { onRegistered: () => void }) {
  const onRegister = async (input: RegistrationInput) => { await registerLocal(input); onRegistered() }
  return <AuthLayout registering><RegisterForm onRegister={onRegister} /></AuthLayout>
}
