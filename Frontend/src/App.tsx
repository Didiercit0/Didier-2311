import { LoginPage } from './pages/LoginPage'
import { useSession } from './hooks/useSession'
import './App.css'

function App() {
  const user = useSession()

  return <LoginPage successMessage={user ? 'Iniciaste sesión correctamente.' : undefined} />
}

export default App
