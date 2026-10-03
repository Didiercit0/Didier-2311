export const SNAILS = ['Rayo Lento', 'Doña Babosa', 'Turbo Concha', 'Capitán Baba', 'Relámpago', 'Sir Espiral'] as const
export type SnailName = typeof SNAILS[number]

export interface RaceResult {
  id: number
  name: string
  distance: string
  winner: SnailName
  winnerLabel?: string
  time: string
  dividend: string
}

export const RACE_RESULTS: readonly RaceResult[] = [
  { id: 1, name: 'Copa Rocío Matinal', distance: '1.20 metros', winner: 'Rayo Lento', time: '14 min 32 seg', dividend: '$3.40 sFL' },
  { id: 2, name: 'Trofeo Lechuga Romana', distance: '1.00 metro', winner: 'Doña Babosa', time: '16 min 05 seg', dividend: '$4.80 sFL' },
  { id: 3, name: 'Clásico Musgo Dorado', distance: '1.50 metros', winner: 'Turbo Concha', time: '18 min 48 seg', dividend: '$2.10 sFL' },
  { id: 4, name: 'Sprint de la Pérgola', distance: '0.80 metros', winner: 'Relámpago', winnerLabel: 'Relámpago Gris', time: '11 min 19 seg', dividend: '$5.25 sFL' },
  { id: 5, name: 'Corona de Tréboles', distance: '1.20 metros', winner: 'Sir Espiral', time: '15 min 42 seg', dividend: '$3.90 sFL' },
  { id: 6, name: 'Gran Premio de la Tarde', distance: '1.40 metros', winner: 'Rayo Lento', time: '13 min 58 seg', dividend: '$2.85 sFL' },
]
export const RACE_WINNERS = RACE_RESULTS.map(race => race.winner)
export const BETS = { won: 18, lost: 12 } as const

export function getDashboardStats() {
  const total = BETS.won + BETS.lost
  return {
    bets: { ...BETS, total, wonPercent: BETS.won / total * 100, lostPercent: BETS.lost / total * 100 },
    snails: SNAILS.map(name => ({ name, wins: RACE_WINNERS.filter(winner => winner === name).length })),
    raceCount: RACE_RESULTS.length,
  }
}
