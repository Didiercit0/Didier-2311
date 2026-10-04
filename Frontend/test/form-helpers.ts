import { screen } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import { registration } from './fixtures'

// Solo rellena el formulario; cada prueba conserva sus propias comprobaciones.
export async function fillRegistration(user: ReturnType<typeof userEvent.setup>, confirmation = registration.password) {
  await user.type(screen.getByLabelText('Nombre completo'), registration.fullName)
  await user.type(screen.getByLabelText('Correo electrónico'), registration.email)
  await user.type(screen.getByLabelText('Contraseña'), registration.password)
  await user.type(screen.getByLabelText('Confirmar contraseña'), confirmation)
  await user.click(screen.getByRole('checkbox'))
}
