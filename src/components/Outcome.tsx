import type { Player } from '../types';

interface Props {
  players: Player[];
  eliminatedId?: string;
  liarFound?: boolean;
  tied?: boolean;
  /** Cantidad de mentirosos que quedan después de esta ronda */
  remainingLiars: number;
  onNextRound: () => void;  // continuar misma partida
  onNewGame: () => void;    // ir a pantalla final (cuando ya no quedan mentirosos)
}

export default function Outcome({
  players,
  eliminatedId,
  liarFound,
  tied,
  remainingLiars,
  onNextRound,
  onNewGame
}: Props) {
  const eliminated = players.find(p => p.id === eliminatedId);

  const message = tied
    ? 'Se empató la votación, no hay eliminados'
    : liarFound
      ? (remainingLiars === 0 ? '¡Se sacó al ÚLTIMO mentiroso!' : 'Se sacó a un mentiroso')
      : 'No se sacó al mentiroso';

  const showFinish = !tied && !!liarFound && remainingLiars === 0;

  return (
    <section className="card">
      <h2>Fin de la ronda</h2>
      <p>Eliminado: <strong>{tied ? '—' : (eliminated ? eliminated.name : '—')}</strong></p>
      <p>Resultado: <strong>{message}</strong></p>
      <div className='card-complot'>
        <img
          src={`/players/${liarFound ? 'eliminado.gif' : 'shoked.gif'}`}
          alt="mentiroso"
          className='complot'
        />
      </div>
      <div className="row">
        {showFinish ? (
          <button onClick={onNewGame}>Finalizar partida</button>
        ) : (
          <button onClick={onNextRound}>Siguiente ronda</button>
        )}
      </div>
    </section>
  );
}
