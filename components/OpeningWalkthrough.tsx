'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Board from './board/Board';
import MoveList from './MoveList';
import { buildLine, resolveStartFen } from '@/lib/chess/opening-line';
import { sanToEs } from '@/lib/chess/notation-es';
import { uciToSquares } from '@/lib/chess/game';
import type { Opening } from '@/lib/content/schemas';
import { updateOpening, useProgress } from '@/lib/progress/store';

/** Recorrido paso a paso de una apertura con una frase breve por jugada. */
export default function OpeningWalkthrough({ opening }: { opening: Opening }) {
  const line = useMemo(() => buildLine(opening), [opening]);
  const [index, setIndex] = useState(-1); // -1 = posición inicial
  const { progress, update } = useProgress();

  const atEnd = index === line.length - 1;
  useEffect(() => {
    if (atEnd && !progress.openings[opening.id]?.walkthroughDone) {
      update((p) => updateOpening(p, opening.id, (o) => ({ ...o, walkthroughDone: true })));
    }
  }, [atEnd, opening.id, progress.openings, update]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(line.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(-1, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [line.length]);

  const ply = index >= 0 ? line[index] : null;
  const fen = ply ? ply.fenAfter : resolveStartFen(opening.startFen);
  const moveNumber = ply ? `${Math.floor(ply.ply / 2) + 1}${ply.color === 'w' ? '.' : '...'}` : '';

  return (
    <div className="trainer">
      <Board
        fen={fen}
        orientation={opening.side}
        movable={null}
        lastMove={ply ? uciToSquares(ply.uci) : null}
        coordinates={progress.settings.showCoordinates}
      />
      <div className="panel">
        <div className="step-note" aria-live="polite">
          {ply ? (
            <>
              <strong>
                {moveNumber}
                {sanToEs(ply.san)}
              </strong>{' '}
              {ply.note}
            </>
          ) : (
            <>{opening.summary} Pulsa «Siguiente» para empezar.</>
          )}
        </div>
        <div className="controls">
          <button type="button" onClick={() => setIndex(-1)} disabled={index < 0} aria-label="Al principio">
            ⏮
          </button>
          <button type="button" onClick={() => setIndex(index - 1)} disabled={index < 0}>
            ◀ Anterior
          </button>
          <button type="button" className="primary" onClick={() => setIndex(index + 1)} disabled={atEnd}>
            Siguiente ▶
          </button>
        </div>
        <MoveList sans={line.map((p) => p.san)} current={index} onSelect={setIndex} />
        {atEnd && (
          <p className="cta">
            Has visto toda la línea.{' '}
            <Link className="button primary" href={`/aperturas/${opening.id}/practica/`}>
              Practicar ahora
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
