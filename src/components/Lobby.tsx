import { useMemo, useState } from 'react';
import { PRESETS } from '../data/presets.tsx';
import Select from './ui/Select';

type Props = {
  categories: string[];
  onStart: (
    playersIn: { id: string; name: string }[],
    category: string,
    liarsCountIn: number
  ) => void;
};

function makeIdFromName(name: string) {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-') || `p-${Date.now()}`
  ) + '-' + Math.random().toString(36).slice(2, 6);
}

export default function Lobby({ categories, onStart }: Props) {
  const [selected, setSelected] = useState<Array<{ id: string; name: string }>>([]);
  const [category, setCategory] = useState<string>(categories[0] || 'peliculas');
  const [liarsCount, setLiarsCount] = useState<number>(1);
  const [manualName, setManualName] = useState<string>('');

  const maxLiars = useMemo(() => {
    const n = selected.length;
    return Math.max(1, Math.floor((n - 1) / 2));
  }, [selected.length]);

  const liarsClamped = Math.min(Math.max(1, liarsCount), Math.max(1, maxLiars));

  function toggleSelect(p: { id: string; name: string }) {
    setSelected(prev => {
      const exists = prev.some(x => x.id === p.id);
      const next = exists ? prev.filter(x => x.id !== p.id) : [...prev, p];
      const newMax = Math.max(1, Math.floor((next.length - 1) / 2));
      if (liarsCount > newMax) setLiarsCount(newMax);
      return next;
    });
  }

  function addManual() {
    const name = manualName.trim();
    if (!name) return;

    const alreadySelected = selected.some(p => p.name.toLowerCase() === name.toLowerCase());
    const alreadyPresetSelected = PRESETS.some(
      p => p.name.toLowerCase() === name.toLowerCase() && selected.some(s => s.id === p.id)
    );
    if (alreadySelected || alreadyPresetSelected) {
      setManualName('');
      return;
    }

    const newPlayer = { id: makeIdFromName(name), name };
    setSelected(prev => {
      const next = [...prev, newPlayer];
      const newMax = Math.max(1, Math.floor((next.length - 1) / 2));
      if (liarsCount > newMax) setLiarsCount(newMax);
      return next;
    });
    setManualName('');
  }

  function removeSelected(id: string) {
    setSelected(prev => {
      const next = prev.filter(p => p.id !== id);
      const newMax = Math.max(1, Math.floor((next.length - 1) / 2));
      if (liarsCount > newMax) setLiarsCount(newMax);
      return next;
    });
  }

  const canStart = selected.length >= 3;

  // Opciones para los selects custom
  const categoryOptions = categories.map(c => ({ value: c, label: c }));
  const liarOptions = Array.from({ length: Math.max(1, maxLiars) }, (_, i) => {
    const n = i + 1;
    return { value: String(n), label: String(n) };
  });

  return (
    <section className="card">
      <h2>Lobby</h2>
      <p className="muted">Elegí jugadores, categoría y cantidad de mentirosos.</p>

      {/* Roster */}
      <div className="grid">
        {PRESETS.map(p => {
          const isSelected = selected.some(s => s.id === p.id);
          const initials =
            p.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase() || '?';
          return (
            <div
              key={p.id}
              className={`tile ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleSelect({ id: p.id, name: p.name })}
              role="button"
              aria-pressed={isSelected}
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' ? toggleSelect({ id: p.id, name: p.name }) : null)}
            >
              <div className="tile-img">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    onError={ev => { (ev.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : null}
                {!p.image && <div className="tile-fallback">{initials}</div>}
                {isSelected && <div className="tile-check">✓</div>}
              </div>
              <div className="tile-name">{p.name}</div>
            </div>
          );
        })}
      </div>

      {/* Agregar manual */}
      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Agregar participante manual</h3>
        <div className="row">
          <input
            type="text"
            placeholder="Nombre del participante"
            value={manualName}
            onChange={e => setManualName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addManual(); }}
          />
          <button onClick={addManual} disabled={!manualName.trim()}>Agregar</button>
        </div>

        {selected.length > 0 && (
          <>
            <p className="muted" style={{ marginTop: 4 }}>
              Participantes: {selected.length}
            </p>
            <div className="list">
              {selected.map(p => (
                <div key={p.id} className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <strong>{p.name}</strong>
                    <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>({p.id})</span>
                  </div>
                  <button onClick={() => removeSelected(p.id)}>Quitar</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Configuración (Select custom) */}
      <div className="row" style={{ marginTop: 16 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          Categoría
          <Select
            value={category}
            options={categoryOptions}
            onChange={v => setCategory(v)}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          # de mentirosos
          <Select
            value={String(liarsClamped)}
            options={liarOptions}
            onChange={v => setLiarsCount(parseInt(v, 10))}
          />
          <span className="muted" style={{ fontSize: 12 }}>
            Máx: {Math.max(1, maxLiars)} para {selected.length} jugadores
          </span>
        </label>
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <button onClick={() => onStart(selected, category, liarsClamped)} disabled={!canStart}>
          Empezar
        </button>
        {!canStart && <span className="muted">Mínimo 3 jugadores para iniciar</span>}
      </div>
    </section>
  );
}
