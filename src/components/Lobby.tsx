// src/components/Lobby.tsx
import { useMemo, useState } from 'react';

// Ajustá la ruta si tu archivo está en otro lugar
import { PRESETS } from '../data/presets.tsx';

type Props = {
  categories: string[];
  onStart: (
    playersIn: { id: string; name: string }[],
    category: string,
    liarsCountIn: number
  ) => void;
};

// Util para generar IDs simples y únicos (para manuales)
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

  // NUEVO: input para agregar manualmente
  const [manualName, setManualName] = useState<string>('');

  // Max mentirosos permitido por # de jugadores
  const maxLiars = useMemo(() => {
    const n = selected.length;
    return Math.max(1, Math.floor((n - 1) / 2));
  }, [selected.length]);

  // Clamp por si cambia la selección
  const liarsClamped = Math.min(Math.max(1, liarsCount), Math.max(1, maxLiars));

  function toggleSelect(p: { id: string; name: string }) {
    setSelected((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      const next = exists ? prev.filter((x) => x.id !== p.id) : [...prev, p];
      // Ajustar # liars si quedó fuera de rango
      const newMax = Math.max(1, Math.floor((next.length - 1) / 2));
      if (liarsCount > newMax) setLiarsCount(newMax);
      return next;
    });
  }

  function addManual() {
    const name = manualName.trim();
    if (!name) return;

    // Evitar duplicado exacto por nombre entre seleccionados
    const alreadySelected = selected.some((p) => p.name.toLowerCase() === name.toLowerCase());

    // Evitar duplicado exacto de un preset ya seleccionado
    const alreadyPresetSelected = PRESETS.some(
      (p) =>
        p.name.toLowerCase() === name.toLowerCase() &&
        selected.some((s) => s.id === p.id)
    );

    if (alreadySelected || alreadyPresetSelected) {
      setManualName('');
      return;
    }

    const newPlayer = { id: makeIdFromName(name), name };
    setSelected((prev) => {
      const next = [...prev, newPlayer];
      const newMax = Math.max(1, Math.floor((next.length - 1) / 2));
      if (liarsCount > newMax) setLiarsCount(newMax);
      return next;
    });
    setManualName('');
  }

  function removeSelected(id: string) {
    setSelected((prev) => {
      const next = prev.filter((p) => p.id !== id);
      const newMax = Math.max(1, Math.floor((next.length - 1) / 2));
      if (liarsCount > newMax) setLiarsCount(newMax);
      return next;
    });
  }

  const canStart = selected.length >= 3;

  return (
    <section className="card">
      <h2>Lobby</h2>
      <p className="muted">Elegí jugadores, categoría y cantidad de mentirosos.</p>

      {/* --- Roster con presets (usa PRESETS + image) --- */}
      <div className="grid">
        {PRESETS.map((p) => {
          const isSelected = selected.some((s) => s.id === p.id);
          const initials =
            p.name
              .split(' ')
              .map((x) => x[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || '?';
          return (
            <div
              key={p.id}
              className={`tile ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleSelect({ id: p.id, name: p.name })}
              role="button"
              aria-pressed={isSelected}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' ? toggleSelect({ id: p.id, name: p.name }) : null)}
            >
              <div className="tile-img">
                {p.image ? (
                  <img
                    src={p.image}         // ← usa tu campo "image"
                    alt={p.name}
                    onError={(ev) => {
                      // si la imagen no existe, escondemos el <img> para que se vea el fallback
                      const t = ev.currentTarget as HTMLImageElement;
                      t.style.display = 'none';
                    }}
                  />
                ) : null}
                {/* fallback con iniciales si no hay imagen o falló */}
                {!p.image && <div className="tile-fallback">{initials}</div>}
                {isSelected && <div className="tile-check">✓</div>}
              </div>
              <div className="tile-name">{p.name}</div>
            </div>
          );
        })}
      </div>

      {/* --- Agregar participante manual --- */}
      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Agregar participante manual</h3>
        <div className="row">
          <input
            type="text"
            placeholder="Nombre del participante"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addManual();
            }}
          />
          <button onClick={addManual} disabled={!manualName.trim()}>
            Agregar
          </button>
        </div>

        {/* Lista de seleccionados con opción de quitar */}
        {selected.length > 0 && (
          <>
            <p className="muted" style={{ marginTop: 4 }}>
              Participantes: {selected.length}
            </p>
            <div className="list">
              {selected.map((p) => (
                <div key={p.id} className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <strong>{p.name}</strong>
                    <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>
                      ({p.id})
                    </span>
                  </div>
                  <button onClick={() => removeSelected(p.id)}>Quitar</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- Configuración de partida --- */}
      <div className="row" style={{ marginTop: 16 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          Categoría
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          # de mentirosos
          <select
            value={liarsClamped}
            onChange={(e) => setLiarsCount(parseInt(e.target.value, 10))}
            disabled={selected.length < 3}
          >
            {Array.from({ length: Math.max(1, maxLiars) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
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
