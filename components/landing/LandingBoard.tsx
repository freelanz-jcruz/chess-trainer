'use client';
import { useEffect, useState } from 'react';
import Board from '@/components/board/Board';
import { playUci, uciToSquares } from '@/lib/chess/game';
import { formatMoveList } from '@/lib/chess/notation-es';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
/** Apertura Italiana: la primera del repertorio de la app. */
const LINE = ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5'];
const STEP_MS = 1300;
const PAUSE_MS = 3200;

type Frame = { fen: string; lastMove: [string, string] | null; sans: string[] };

/** Posiciones de la línea, calculadas una vez. */
const FRAMES: Frame[] = LINE.reduce<Frame[]>(
  (frames, uci) => {
    const prev = frames[frames.length - 1];
    const m = playUci(prev.fen, uci)!;
    frames.push({ fen: m.fenAfter, lastMove: uciToSquares(uci), sans: [...prev.sans, m.san] });
    return frames;
  },
  [{ fen: START, lastMove: null, sans: [] }],
);

/**
 * Tablero de muestra de la landing: reproduce en bucle las primeras jugadas de la Italiana, como en el
 * recorrido de aperturas. Con «reducir movimiento» del sistema se queda quieto en la posición final.
 */
export default function LandingBoard() {
  const [i, setI] = useState(FRAMES.length - 1);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let index = 0;
    let timer: number;
    const tick = () => {
      // En segundo plano no se anima (ahorra batería); se retoma al volver.
      if (!document.hidden) {
        index = index >= FRAMES.length - 1 ? 0 : index + 1;
        setI(index);
      }
      timer = window.setTimeout(tick, index === FRAMES.length - 1 ? PAUSE_MS : STEP_MS);
    };
    setI(0);
    timer = window.setTimeout(tick, STEP_MS);
    return () => clearTimeout(timer);
  }, []);

  const frame = FRAMES[i];
  return (
    <figure className="m-0 grid gap-3">
      <div className="pointer-events-none" aria-hidden>
        <Board fen={frame.fen} orientation="white" movable={null} lastMove={frame.lastMove} coordinates={false} />
      </div>
      <figcaption className="text-center text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">Apertura Italiana</span>
        <span className="block min-h-[1.5em] tabular-nums">{formatMoveList(frame.sans) || 'Posición inicial'}</span>
      </figcaption>
    </figure>
  );
}
