import { useEffect, useState } from 'react'
import { useRoute } from './hooks/useRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { useSession } from './hooks/useSession'
import { protectedRoute } from './domain/navigation'
import './App.css'

function App() {
  const requestedRoute = useRoute()
  const user = useSession()
  const route = protectedRoute(requestedRoute, Boolean(user))
  const [registrationMessage, setRegistrationMessage] = useState('')

  useEffect(() => {
    const title = route === 'dashboard' ? 'La tribuna' : route === 'register' ? 'Crear cuenta' : 'Iniciar sesión'
    document.title = `${title} | Caracol Club`
    if (requestedRoute !== route) window.location.hash = route === 'dashboard' ? '/dashboard' : '/login'
  }, [route, requestedRoute])

  function handleRegistered() {
    setRegistrationMessage('Tu cuenta se creó correctamente. Inicia sesión para entrar al club.')
    window.location.hash = '/login'
  }

  if (user) return <DashboardPage user={user} />

  return route === 'register'
    ? <RegisterPage onRegistered={handleRegistered} />
    : <LoginPage successMessage={registrationMessage} />
}

export default App
