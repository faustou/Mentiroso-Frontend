import React from 'react';
import { PRESETS } from '../data/presets';
import PlayerTile from './PlayerTile';

interface Props {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function PlayerGrid({ selectedIds, onToggle }: Props) {
  return (
    <div className="grid">
      {PRESETS.map(p => (
        <PlayerTile
          key={p.id}
          data={p}
          selected={selectedIds.includes(p.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
