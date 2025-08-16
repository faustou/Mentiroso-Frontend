import type { Player } from '../types';

interface Props {
  players: Player[];
  roundNumber: number;
  onBeginVote: () => void;
}

export default function Ready({ players, roundNumber, onBeginVote }: Props) {
  return (
    <section className="card">
      <h2>Ronda {roundNumber + 1}</h2>
      <p className="muted">
        ¿Listos para votar de nuevo? (Jugadores activos: <strong>{players.length}</strong>)
      </p>
      <div className="row">
        <button onClick={onBeginVote}>Comenzar votación</button>
      </div>
    </section>
  );
}
