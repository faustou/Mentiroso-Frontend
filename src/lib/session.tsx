// src/lib/session.ts
export function getSessionId(): string {
  const KEY = 'mentiroso_session';
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(KEY, v);
  }
  return v;
}

export function resetSessionId(): void {
  localStorage.removeItem('mentiroso_session');
}
