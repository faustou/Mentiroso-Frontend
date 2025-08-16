// src/components/Reveal.tsx
import React, { useState, useEffect } from 'react';
import type { Player } from '../types';

interface Props {
  players: Player[];
  currentIndex: number;
  category: string;
  secretWord: string;
  liarIds: string[];
  onNext: () => void;
  imageUrl?: string;  // foto (si viene de TMDb)
}

function formatCategorySingular(category: string): string {
  const lower = category.toLowerCase();
  if (lower === 'peliculas') return 'película';
  if (lower === 'famosos') return 'famoso';
  return lower.replace(/s$/, '');
}

export default function Reveal({
  players,
  currentIndex,
  category,
  secretWord,
  liarIds,
  onNext,
  imageUrl
}: Props) {
  const player = players[currentIndex];
  const isLiar = liarIds.includes(player.id);

  const [visible, setVisible] = useState(false);
  const [showImg, setShowImg] = useState(true);

  useEffect(() => {
    setVisible(false);
    setShowImg(true); // reset al pasar el teléfono
  }, [currentIndex]);

  // Debug rápido: confirmá que llega la URL cuando corresponde
  useEffect(() => {
    if (visible && !isLiar && category.toLowerCase() === 'famosos') {
      // eslint-disable-next-line no-console
      console.log('Reveal imageUrl:', imageUrl);
    }
  }, [visible, isLiar, category, imageUrl]);

  const label = formatCategorySingular(category);

  return (
    <section className="card reveal">
      <h2>Revelación ({currentIndex + 1}/{players.length})</h2>
      <p className="muted">
        Pasá el dispositivo a: <strong>{player.name}</strong>
      </p>

      {!visible ? (
        <div className="panel">
          <p>Toque para ver su rol.</p>
          <div className="row">
            <button onClick={() => setVisible(true)}>Mostrar</button>
          </div>
        </div>
      ) : (
        <div className="panel">
          {isLiar ? (
            <>
              <div className="card-complot">
                <img
                  src="/players/mentiroso.jpg"       // ← ruta desde /public
                  alt="mentiroso"
                  className="complot"
                />
              </div>
              <h3>
                Sos <span className="liar">MENTIROSO</span>
              </h3>
              <p>No hay {label} para vos.</p>
            </>
          ) : (
            <>
              <div className="card-complot">
                <img
                  src="/players/dramatic.gif"         // ← ruta desde /public
                  alt="dramatic"
                  className="complot"
                />
              </div>
              <h3>
                Sos <span className="normal">NORMAL</span>
              </h3>
              <p style={{ textTransform: 'capitalize' }}>{label}:</p>
              <div className="secret">{secretWord}</div>

              {/* Foto del famoso si llega meta.image */}
              {category.toLowerCase() === 'famosos' && imageUrl && showImg && (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={imageUrl}
                    alt={secretWord}
                    style={{ width: '100%', maxWidth: 320, borderRadius: 12, display: 'block' }}
                    onError={() => setShowImg(false)}  // oculta si falla la carga
                    crossOrigin="anonymous"
                  />
                </div>
              )}
            </>
          )}

          <div className="row">
            <button
              onClick={() => {
                setVisible(false);
                onNext();
              }}
            >
              Ocultar y pasar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
