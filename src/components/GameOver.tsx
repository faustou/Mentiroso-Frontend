
interface Props {
  liarFound: boolean;   // true = mentiroso descubierto
  onBackToLobby: () => void;
}

export default function GameOver({ liarFound, onBackToLobby }: Props) {
  return (
    <section className="card">
      <h2>{liarFound ? '¡MENTIROSO DESCUBIERTO!' : '¡GANÓ EL MENTIROSO!'}</h2>
      <p className="muted">
        {liarFound
          ? 'El grupo encontró al mentiroso. ¡Bien jugado!'
          : 'El mentiroso sobrevivió. ¡Otra vez será!'}
      </p>
      <div className="row">
        <button onClick={onBackToLobby}>Volver al lobby</button>
      </div>
    </section>
  );
}
