import { describe, expect, it } from 'vitest'
import { getDashboardStats, RACE_RESULTS, SNAILS } from '../src/domain/dashboard'
import { protectedRoute, readRoute } from '../src/domain/navigation'

describe('Acceso y estadísticas del dashboard', () => {
  it('sin sesión envía el acceso al dashboard hacia login', () => {
    expect(protectedRoute('dashboard', false)).toBe('login')
    expect(protectedRoute('register', false)).toBe('register')
  })

  it('con sesión permite entrar al dashboard', () => {
    expect(protectedRoute('dashboard', true)).toBe('dashboard')
    expect(protectedRoute('login', true)).toBe('dashboard')
    expect(readRoute('#/dashboard')).toBe('dashboard')
  })

  it('existen seis caracoles diferentes y seis carreras diferentes', () => {
    expect(SNAILS).toHaveLength(6)
    expect(new Set(SNAILS).size).toBe(6)
    expect(RACE_RESULTS).toHaveLength(6)
    expect(new Set(RACE_RESULTS.map(race => race.id)).size).toBe(6)
    for (const race of RACE_RESULTS) expect(SNAILS).toContain(race.winner)
  })

  it('las victorias suman seis y coinciden con los resultados de las carreras', () => {
    const stats = getDashboardStats()
    expect(stats.raceCount).toBe(6)
    expect(stats.snails.reduce((total, snail) => total + snail.wins, 0)).toBe(6)
    expect(stats.snails.map(snail => snail.wins)).toEqual([2, 1, 1, 0, 1, 1])
  })

  it('las apuestas y sus porcentajes son congruentes', () => {
    expect(getDashboardStats().bets).toEqual({
      won: 18, lost: 12, total: 30, wonPercent: 60, lostPercent: 40,
    })
  })
})
