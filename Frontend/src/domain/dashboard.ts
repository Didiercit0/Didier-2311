export const SNAILS = ['Flash', 'Concha Veloz', 'Babosín', 'Trueno', 'Rayo Lento', 'Caracolín'] as const
export const RACE_WINNERS = ['Trueno', 'Flash', 'Trueno', 'Concha Veloz', 'Rayo Lento', 'Flash'] as const
export const BETS = { won: 18, lost: 12 } as const

export function getDashboardStats() {
  const total = BETS.won + BETS.lost
  return {
    bets: { ...BETS, total, wonPercent: BETS.won / total * 100, lostPercent: BETS.lost / total * 100 },
    snails: SNAILS.map(name => ({ name, wins: RACE_WINNERS.filter(winner => winner === name).length })),
    raceCount: RACE_WINNERS.length,
  }
}
