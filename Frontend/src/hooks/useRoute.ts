import { useEffect, useState } from 'react'
import { readRoute } from '../domain/navigation'
const currentRoute = () => readRoute(window.location.hash)

export function useRoute() {
  const [route, setRoute] = useState(currentRoute)
  useEffect(() => {
    const update = () => setRoute(currentRoute())
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return route
}
