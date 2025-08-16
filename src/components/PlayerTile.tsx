import { useState } from 'react';
import type { PresetPlayer } from '../data/presets';

// Render de una sola “carta” de jugador
interface Props {
  data: PresetPlayer;
  selected: boolean;
  onToggle: (id: string) => void;
}

export default function PlayerTile({ data, selected, onToggle }: Props) {
  const [imgError, setImgError] = useState(false);
  const initials = data.name
    .split(/\s+/)
    .map(s => s[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  return (
    <button
      className={`tile ${selected ? 'selected' : ''}`}
      onClick={() => onToggle(data.id)}
      aria-pressed={selected}
      title={data.name}
    >
      <div className="tile-img">
        {!imgError && data.image ? (
          <img
            src={data.image}
            alt={data.name}
            onError={() => setImgError(true)}
            draggable={false}
          />
        ) : (
          <div className="tile-fallback">{initials}</div>
        )}
        {selected && <div className="tile-check" aria-hidden>✓</div>}
      </div>
      <div className="tile-name">{data.name}</div>
    </button>
  );
}
