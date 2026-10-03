import { useEffect, useState } from 'react'
import { ACCOUNT_KEY, SESSION_KEY, SESSION_EVENT, getCurrentUser } from '../services/local-auth'

export function useSession() {
  const [user, setUser] = useState(getCurrentUser)

  useEffect(() => {
    const refresh = () => setUser(getCurrentUser())
    const syncStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === ACCOUNT_KEY || event.key === SESSION_KEY) refresh()
    }
    window.addEventListener(SESSION_EVENT, refresh)
    window.addEventListener('storage', syncStorage)
    return () => {
      window.removeEventListener(SESSION_EVENT, refresh)
      window.removeEventListener('storage', syncStorage)
    }
  }, [])

  return user
}
