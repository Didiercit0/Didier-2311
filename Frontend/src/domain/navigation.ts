export type Route = 'login' | 'register'

export function readRoute(hash: string): Route {
  return hash === '#/registro' ? 'register' : 'login'
}
