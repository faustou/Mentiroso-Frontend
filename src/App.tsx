// src/App.tsx
import React, { useEffect, useState } from 'react';
import type { Player, RoundState } from './types';
import { fetchCategories, fetchSecret } from './lib/api';
import Lobby from './components/Lobby';
import Reveal from './components/Reveal';
import Vote from './components/Vote';
import Outcome from './components/Outcome';
import Ready from './components/Ready';
import GameOver from './components/GameOver';
import './styles.css';

export default function App() {
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [state, setState] = useState<RoundState | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setError('No se pudieron cargar categorías'));
  }, []);

  // ===== Inicia PARTIDA: fija palabra y N mentirosos, hace 1ª ronda con REVEAL
  async function startGame(
    playersIn: { id: string; name: string }[],
    category: string,
    liarsCountIn: number
  ) {
    setError('');
    setLoading(true);
    try {
      const secret = await fetchSecret(category); // ← ahora trae meta
      const secretWord = secret.text;

      const maxLiars = Math.floor((playersIn.length - 1) / 2);
      const liarsCount = Math.max(1, Math.min(liarsCountIn, maxLiars));

      const shuffled = [...playersIn].sort(() => Math.random() - 0.5);
      const liarIds = shuffled.slice(0, liarsCount).map((p) => p.id);

      const players: Player[] = playersIn.map((p) => ({
        id: p.id,
        name: p.name,
        role: liarIds.includes(p.id) ? 'MENTIROSO' : 'NORMAL',
        voteForId: undefined
      }));

      const nextState: RoundState = {
        phase: 'reveal',
        roundNumber: 1,
        category,
        secretWord,
        players,
        liarIds,
        currentIndex: 0,
        hasRevealedOnce: false,
        secretMeta: secret.meta || {} // ← guardar meta (imagen)
      };

      setState(nextState);
      // DEBUG: asegurar que guardó el meta y la imagen
      // eslint-disable-next-line no-console
      console.log('App setState secretMeta:', nextState.secretMeta);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Error iniciando la partida');
    } finally {
      setLoading(false);
    }
  }

  // ===== REVEAL → VOTE (solo la primera vez)
  function nextReveal() {
    if (!state || state.phase !== 'reveal') return;
    const next = state.currentIndex + 1;

    if (next >= state.players.length) {
      // Antes de entrar a la primera votación, chequear igualdad
      const liarsCount = state.liarIds.length;
      const normalsCount = state.players.length - liarsCount;
      if (liarsCount >= normalsCount) {
        setState({ ...state, phase: 'gameover', liarFound: false });
        return;
      }
      setState({ ...state, phase: 'vote', currentIndex: 0, hasRevealedOnce: true });
    } else {
      setState({ ...state, currentIndex: next });
    }
  }

  // ===== Registrar voto
  function submitVote(voterId: string, targetId: string) {
    if (!state || state.phase !== 'vote') return;
    if (voterId === targetId) return;

    const players = state.players.map((p) =>
      p.id === voterId ? { ...p, voteForId: targetId } : p
    );
    const everyoneVoted = players.every((p) => !!p.voteForId);
    if (!everyoneVoted) {
      setState({ ...state, players, currentIndex: state.currentIndex + 1 });
      return;
    }

    // Conteo
    const counts = new Map<string, number>();
    for (const p of players) if (p.voteForId) counts.set(p.voteForId, (counts.get(p.voteForId) ?? 0) + 1);

    let topIds: string[] = [];
    let topVotes = -1;
    counts.forEach((v, k) => {
      if (v > topVotes) { topVotes = v; topIds = [k]; }
      else if (v === topVotes) { topIds.push(k); }
    });

    const tied = topIds.length !== 1 || topVotes <= 0;
    const eliminatedId = tied ? undefined : topIds[0];
    const liarFound = !!eliminatedId && state.liarIds.includes(eliminatedId);

    setState({
      ...state,
      players,
      phase: 'outcome',
      currentIndex: 0,
      eliminatedId,
      liarFound,
      tied
    });
  }

  // ===== Siguiente ronda (misma palabra y MISMO(S) mentiroso(s) restantes) — sin revelar de nuevo
  async function nextRoundSameWord() {
    if (!state) return;
    const { eliminatedId, tied, category, secretWord } = state;

    // Actualizar lista de mentirosos si se eliminó alguno esta ronda
    let nextLiarIds = state.liarIds;
    if (!tied && eliminatedId && state.liarIds.includes(eliminatedId)) {
      nextLiarIds = state.liarIds.filter((id) => id !== eliminatedId);
    }

    // Si no quedan mentirosos → victoria del equipo (descubiertos)
    if (nextLiarIds.length === 0) {
      setState({ ...state, phase: 'gameover', liarFound: true });
      return;
    }

    // Base de jugadores para la próxima ronda (si hubo eliminación, lo quitamos)
    let nextPlayers = state.players;
    if (!tied && eliminatedId) {
      nextPlayers = nextPlayers.filter((p) => p.id !== eliminatedId);
    }

    // Reasignar roles (mismos mentirosos restantes) y limpiar votos
    const rebuilt = nextPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      role: nextLiarIds.includes(p.id) ? 'MENTIROSO' : 'NORMAL',
      voteForId: undefined
    }));

    // Condición de victoria de mentirosos
    const liarsCount = nextLiarIds.length;
    const normalsCount = rebuilt.length - liarsCount;
    if (liarsCount >= normalsCount) {
      setState({ ...state, phase: 'gameover', liarFound: false });
      return;
    }

    // Continuar partida (sin volver a revelar)
    setState({
      phase: 'ready',
      roundNumber: state.roundNumber, // Ready mostrará N+1 al pasar a vote
      category,
      secretWord,
      players: rebuilt,
      liarIds: nextLiarIds,
      currentIndex: 0,
      hasRevealedOnce: true,
      tied: false,
      eliminatedId: undefined,
      liarFound: false,
      // MUY IMPORTANTE: mantener secretMeta entre fases
      secretMeta: state.secretMeta
    });
  }

  function beginVoteAfterReady() {
    if (!state || state.phase !== 'ready') return;

    const liarsCount = state.liarIds.length;
    const normalsCount = state.players.length - liarsCount;
    if (liarsCount >= normalsCount) {
      setState({ ...state, phase: 'gameover', liarFound: false });
      return;
    }

    setState({
      ...state,
      phase: 'vote',
      roundNumber: state.roundNumber + 1,
      currentIndex: 0
    });
  }

  function goToGameOver() {
    if (!state) return;
    setState({ ...state, phase: 'gameover' });
  }

  function backToLobby() {
    setState(null);
  }

  const phase = state?.phase ?? 'lobby';

  return (
    <div className="app">
      <header>
        <h1>Mentiroso</h1>
        <p className="subtitle">Misma palabra y mismos mentirosos hasta que los saquen</p>
      </header>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Cargando…</p>}

      {phase === 'lobby' && (
        <Lobby
          categories={categories.length ? categories : ['peliculas', 'famosos']}
          onStart={startGame}
        />
      )}

      {state && phase === 'reveal' && (
        <Reveal
          players={state.players}
          currentIndex={state.currentIndex}
          category={state.category}
          secretWord={state.secretWord}
          liarIds={state.liarIds}
          imageUrl={state.secretMeta?.image}   // ← pasar imagen
          onNext={nextReveal}
        />
      )}

      {state && phase === 'vote' && (
        <Vote
          players={state.players}
          currentIndex={state.currentIndex}
          onSubmitVote={submitVote}
        />
      )}

      {state && phase === 'outcome' && (
        <Outcome
          players={state.players}
          eliminatedId={state.eliminatedId}
          liarFound={state.liarFound}
          tied={state.tied}
          remainingLiars={
            state.eliminatedId
              ? state.liarIds.filter((id) => id !== state.eliminatedId).length
              : state.liarIds.length
          }
          onNextRound={nextRoundSameWord}
          onNewGame={goToGameOver}
        />
      )}

      {state && phase === 'ready' && (
        <Ready
          players={state.players}
          roundNumber={state.roundNumber}
          onBeginVote={beginVoteAfterReady}
        />
      )}

      {state && phase === 'gameover' && (
        <GameOver liarFound={!!state.liarFound} onBackToLobby={backToLobby} />
      )}
    </div>
  );
}
