// src/lib/api.ts
import type { RandomResult } from '../types';
import { getSessionId } from './session';

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';

export async function fetchCategories(): Promise<string[]> {
  const r = await fetch(`${BASE_URL}/categories`, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('No se pudieron cargar categorías');
  const data = (await r.json()) as { categories: Array<string | null | undefined> };
  return (data.categories || []).filter((c): c is string => typeof c === 'string' && !!c);
}

/** NUEVO: devuelve { text, category, source, meta } */
export async function fetchSecret(category: string): Promise<RandomResult> {
  const u = new URL(`${BASE_URL}/random`);
  u.searchParams.set('category', category);
  u.searchParams.set('session', getSessionId()); // evita repetidos en la partida
  const r = await fetch(u, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('No se pudo obtener la palabra');
  return (await r.json()) as RandomResult;
}

/** Compat: si en algún lado seguís usando “solo palabra” */
export async function fetchSecretWord(category: string): Promise<string> {
  const res = await fetchSecret(category);
  return res.text;
}
