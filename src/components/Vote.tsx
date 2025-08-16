import { useEffect, useState } from 'react';
import type { Player } from '../types';

interface Props {
  players: Player[];
  currentIndex: number;
  onSubmitVote: (voterId: string, targetId: string) => void;
}

export default function Vote({ players, currentIndex, onSubmitVote }: Props) {
  const voter = players[currentIndex];
  const [targetId, setTargetId] = useState<string>('');

  // resetear selección cuando cambia el votante
  useEffect(() => {
    setTargetId('');
  }, [currentIndex]);

  const options = players.filter((p) => p.id !== voter.id);

  return (
    <section className="card">
      <h2>Votación ({currentIndex + 1}/{players.length})</h2>
      <p>La votacion es anonima y en silencio</p>
      <div className='card-complot'>
        <img
          src="../../public/players/complot.jpg"
          alt="complot"
          className='complot'
        />
      </div>
      <p className="muted">Vota <strong>{voter.name}</strong>: ¿Quién es el mentiroso?</p>

      <div className="row">
        <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
          <option value="" disabled>Elegí a alguien…</option>
          {options.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={() => targetId && onSubmitVote(voter.id, targetId)}
          disabled={!targetId}
        >
          Confirmar voto
        </button>
      </div>
    </section>
  );
}
