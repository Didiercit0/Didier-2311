import { RACE_RESULTS } from '../../domain/dashboard'
import { DashboardIcon } from '../atoms/DashboardIcon'

export function RaceResults() {
  return <section className="dashboard-card results-card" id="race-results" aria-labelledby="race-results-title">
    <header className="results-heading">
      <div><p className="eyebrow">ACTA OFICIAL DE PISTA</p><h2 id="race-results-title">Últimos resultados en pista</h2></div>
      <span className="official-timing"><DashboardIcon name="award" />Cronometría Oficial del Jardín</span>
    </header>
    <div className="table-scroll">
      <table className="race-results-table">
        <caption className="visually-hidden">Resultados de las seis carreras del día simulado. Los dividendos son datos ficticios y no modifican el saldo.</caption>
        <thead><tr><th scope="col">Carrera</th><th scope="col">Distancia</th><th scope="col">Caracol ganador</th><th scope="col">Tiempo registrado</th><th scope="col">Dividendo pagado</th><th scope="col">Estado</th></tr></thead>
        <tbody>{RACE_RESULTS.map(race => <tr key={race.id}>
          <th scope="row">Carrera #{race.id} – {race.name}</th><td>{race.distance}</td>
          <td><span className="winner-name"><span className="snail-avatar" aria-hidden="true">🐌</span>{race.winnerLabel ?? race.winner}</span></td>
          <td>{race.time}</td><td className="race-dividend">{race.dividend}</td><td><span className="official-status">Oficial</span></td>
        </tr>)}</tbody>
      </table>
    </div>
  </section>
}
