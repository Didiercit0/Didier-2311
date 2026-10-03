export type Route = 'login' | 'register' | 'dashboard'

export function readRoute(hash: string): Route {
  if (hash === '#/registro') return 'register'
  if (hash === '#/dashboard') return 'dashboard'
  return 'login'
}

export function protectedRoute(route: Route, authenticated: boolean): Route {
  if (authenticated) return 'dashboard'
  return route === 'register' ? 'register' : 'login'
}
