export function uid() {
  // simple id para elementos de UI
  return Math.random().toString(36).slice(2, 10);
}
