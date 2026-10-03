import { AuthLayout } from '../components/templates/AuthLayout'
import { LoginForm } from '../components/organisms/LoginForm'
import { getSavedEmail, loginLocal } from '../services/local-auth'
import type { LoginInput } from '../domain/user'

export function LoginPage({ successMessage }: { successMessage?: string }) {
  const onLogin = async (input: LoginInput) => {
    await loginLocal(input)

  }
  return (
    <AuthLayout>
      <LoginForm
        initialEmail={getSavedEmail()}
        onLogin={onLogin}
        successMessage={successMessage}
      />
    </AuthLayout>
  )
}
