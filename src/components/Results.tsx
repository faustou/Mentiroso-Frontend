import React from 'react';
import type { Player } from '../types';

interface Props {
  players: Player[];
  liarId: string;
  eliminatedId?: string;
  liarFound?: boolean;
  onNextRound: () => void;
  onBackToLobby: () => void;
}

export default function Results({
  players,
  liarId,
  eliminatedId,
  liarFound,
  onNextRound,
  onBackToLobby
}: Props) {
  const liar = players.find(p => p.id === liarId);
  const eliminated = players.find(p => p.id === eliminatedId);

  return (
    <section className="card">
      <h2>Resultados de la ronda</h2>
      <p>
        Mentiroso era: <strong>{liar?.name}</strong>
        {' '}- {liarFound ? '¡Lo encontraron!' : 'No lo encontraron.'}
      </p>
      <p>
        Eliminado: <strong>{eliminated ? eliminated.name : '—'}</strong>
      </p>

      <table className="table">
        <thead>
          <tr><th>Jugador</th><th>Votó a</th></tr>
        </thead>
        <tbody>
          {players.map(p => {
            const target = players.find(x => x.id === p.voteForId);
            return (
              <tr key={p.id}>
                <td>
                  {p.name}
                  {p.id === liarId ? ' (Mentiroso)' : ''}
                  {p.id === eliminatedId ? ' — ELIMINADO' : ''}
                </td>
                <td>{target ? target.name : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="row">
        <button onClick={onNextRound}>Siguiente ronda</button>
        <button onClick={onBackToLobby}>Terminar</button>
      </div>
    </section>
  );
}
