'use client';
import { useEffect, useRef, useState } from 'react';
import { Chessground } from '@lichess-org/chessground';
import type { Api } from '@lichess-org/chessground/api';
import type { Key } from '@lichess-org/chessground/types';
import { useT } from '@/lib/i18n/react';
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
  { role: 'queen', letter: 'q' },
  { role: 'rook', letter: 'r' },
  { role: 'bishop', letter: 'b' },
  { role: 'knight', letter: 'n' },
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
  const tb = useT().board;
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

  // Chessground dibuja las coordenadas al crearse: si cambian (o se piden ocultas desde el principio), se redibuja.
  useEffect(() => {
    api.current?.redrawAll();
  }, [coordinates]);

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
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      <div ref={el} className="size-full rounded-md overflow-hidden" />
      {promo && (
        <div
          className="absolute inset-0 z-20 grid place-content-center gap-2.5 rounded-sm bg-black/45 text-center text-white"
          role="dialog"
          aria-label={tb.promotionLabel}
        >
          <p className="font-semibold">{tb.promoteTo}</p>
          <div className="flex gap-2">
            {PROMOTION_PIECES.map((p) => (
              <button
                key={p.letter}
                type="button"
                className="size-16 rounded-md border border-border bg-card p-1 hover:bg-accent"
                onClick={() => choose(p.letter)}
                aria-label={tb.pieces[p.role]}
                title={tb.pieces[p.role]}
              >
                <span className="cg-wrap promo-piece relative block size-full">
                  <piece className={`${p.role} ${promo.color}`} />
                </span>
              </button>
            ))}
          </div>
          <button type="button" className="text-white underline" onClick={() => choose(null)}>
            {tb.cancel}
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
