'use client';
import { useEffect, useRef, useState } from 'react';
import { Chessground } from '@lichess-org/chessground';
import type { Api } from '@lichess-org/chessground/api';
import type { Key } from '@lichess-org/chessground/types';
import { isInCheck, isPromotion, legalDests, turnColor, type Color } from '@/lib/chess/game';

export type Arrow = { from: string; to: string; brush?: 'green' | 'red' | 'blue' | 'yellow' };

type Props = {
  fen: string;
  orientation: Color;
  /** Bando que puede mover el usuario; null = tablero bloqueado. */
  movable: Color | null;
  lastMove?: [string, string] | null;
  arrows?: Arrow[];
  /** Casillas resaltadas (p. ej. a dónde puede ir una pieza). */
  highlight?: string[];
  coordinates?: boolean;
  /** `promotion` es la pieza elegida al coronar (q, r, b, n). */
  onMove?: (from: string, to: string, promotion?: string) => void;
};

const PROMOTION_PIECES = [
  { role: 'queen', letter: 'q', label: 'Dama' },
  { role: 'rook', letter: 'r', label: 'Torre' },
  { role: 'bishop', letter: 'b', label: 'Alfil' },
  { role: 'knight', letter: 'n', label: 'Caballo' },
] as const;

/** Envoltorio de Chessground. El estado de la partida vive fuera: este componente solo lo muestra. */
export default function Board({
  fen,
  orientation,
  movable,
  lastMove,
  arrows = [],
  highlight = [],
  coordinates = true,
  onMove,
}: Props) {
  const el = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const fenRef = useRef(fen);
  fenRef.current = fen;
  const [promo, setPromo] = useState<{ from: string; to: string; color: Color } | null>(null);

  useEffect(() => {
    if (!el.current) return;
    api.current = Chessground(el.current, {
      animation: { enabled: true, duration: 220 },
      highlight: { lastMove: true, check: true },
      premovable: { enabled: false },
      draggable: { enabled: true, showGhost: true },
      drawable: { enabled: true, visible: true },
      movable: {
        free: false,
        showDests: true,
        events: {
          after: (from, to) => {
            const current = fenRef.current;
            if (isPromotion(current, from, to)) setPromo({ from, to, color: turnColor(current) });
            else onMoveRef.current?.(from, to);
          },
        },
      },
    });
    return () => {
      api.current?.destroy();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    const turn = turnColor(fen);
    const canMove = movable !== null && movable === turn && !promo;
    api.current?.set({
      fen,
      orientation,
      coordinates,
      turnColor: turn,
      check: isInCheck(fen) ? turn : false,
      lastMove: lastMove ? (lastMove as Key[]) : undefined,
      highlight: { custom: new Map(highlight.map((s) => [s as Key, 'hint'])) },
      movable: {
        color: canMove ? movable : undefined,
        dests: canMove ? (legalDests(fen) as Map<Key, Key[]>) : new Map(),
      },
    });
  }, [fen, orientation, movable, lastMove, coordinates, highlight, promo]);

  useEffect(() => {
    api.current?.setAutoShapes(
      arrows.map((a) => ({ orig: a.from as Key, dest: a.to as Key, brush: a.brush ?? 'green' })),
    );
  }, [arrows]);

  const choose = (letter: string | null) => {
    const p = promo;
    setPromo(null);
    if (!p) return;
    if (letter) onMoveRef.current?.(p.from, p.to, letter);
    else api.current?.set({ fen: fenRef.current }); // cancelar: el peón vuelve atrás
  };

  return (
    <div className="board-frame">
      <div ref={el} className="board" />
      {promo && (
        <div className="promotion" role="dialog" aria-label="Elige la pieza de coronación">
          <p>Coronar a…</p>
          <div className="promotion-options">
            {PROMOTION_PIECES.map((p) => (
              <button key={p.letter} type="button" onClick={() => choose(p.letter)} aria-label={p.label} title={p.label}>
                <span className={`cg-wrap promo-piece`}>
                  <piece className={`${p.role} ${promo.color}`} />
                </span>
              </button>
            ))}
          </div>
          <button type="button" className="link" onClick={() => choose(null)}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      piece: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
