export type Phase = 'lobby' | 'reveal' | 'vote' | 'outcome' | 'ready' | 'gameover';
export type Role = 'MENTIROSO' | 'NORMAL';

export interface Player {
  id: string;
  name: string;
  role: Role;
  voteForId?: string;
}

export interface RoundState {
  phase: Phase;
  roundNumber: number;
  category: string;
  secretWord: string;
  players: Player[];
  liarIds: string[];
  currentIndex: number;
  hasRevealedOnce: boolean;

  // outcome
  eliminatedId?: string;
  liarFound?: boolean;
  tied?: boolean;

  // 👇 NUEVO: para la imagen/meta del secreto (TMDb)
  secretMeta?: {
    image?: string;
    [k: string]: any;
  };
}

export interface RandomResult {
  text: string;
  meta?: { image?: string; [k: string]: any };
}
