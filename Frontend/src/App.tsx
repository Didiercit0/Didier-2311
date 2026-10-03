import { useEffect, useState } from 'react'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { useRoute } from './hooks/useRoute'
import { useSession } from './hooks/useSession'
import './App.css'

function App() {
  const route = useRoute()
  const user = useSession()
  const [registrationMessage, setRegistrationMessage] = useState('')

  useEffect(() => {
    document.title = `${route === 'register' ? 'Crear cuenta' : 'Iniciar sesión'} | Caracol Club`
  }, [route])

  function handleRegistered() {
    setRegistrationMessage('Tu cuenta se creó correctamente. Inicia sesión para entrar al club.')
    window.location.hash = '/login'
  }

  if (route === 'register') {
    return <RegisterPage onRegistered={handleRegistered} />
  }

  return <LoginPage successMessage={user ? 'Iniciaste sesión correctamente.' : registrationMessage} />
}

export default App
