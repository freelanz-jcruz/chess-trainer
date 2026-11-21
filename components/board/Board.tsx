'use client';
import { useEffect, useRef } from 'react';
import { Chessground } from '@lichess-org/chessground';
import type { Api } from '@lichess-org/chessground/api';
import type { Key } from '@lichess-org/chessground/types';
import { isInCheck, legalDests, turnColor, type Color } from '@/lib/chess/game';

export type Arrow = { from: string; to: string; brush?: 'green' | 'red' | 'blue' | 'yellow' };

type Props = {
  fen: string;
  orientation: Color;
  /** Bando que puede mover el usuario; null = tablero bloqueado. */
  movable: Color | null;
  lastMove?: [string, string] | null;
  arrows?: Arrow[];
  coordinates?: boolean;
  onMove?: (from: string, to: string) => void;
};

/** Envoltorio de Chessground. El estado de la partida vive fuera: este componente solo lo muestra. */
export default function Board({ fen, orientation, movable, lastMove, arrows = [], coordinates = true, onMove }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

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
        events: { after: (from, to) => onMoveRef.current?.(from, to) },
      },
    });
    return () => {
      api.current?.destroy();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    const turn = turnColor(fen);
    const canMove = movable !== null && movable === turn;
    api.current?.set({
      fen,
      orientation,
      coordinates,
      turnColor: turn,
      check: isInCheck(fen) ? turn : false,
      lastMove: lastMove ? (lastMove as Key[]) : undefined,
      movable: {
        color: canMove ? movable : undefined,
        dests: canMove ? (legalDests(fen) as Map<Key, Key[]>) : new Map(),
      },
    });
  }, [fen, orientation, movable, lastMove, coordinates]);

  useEffect(() => {
    api.current?.setAutoShapes(
      arrows.map((a) => ({ orig: a.from as Key, dest: a.to as Key, brush: a.brush ?? 'green' })),
    );
  }, [arrows]);

  return (
    <div className="board-frame">
      <div ref={el} className="board" />
    </div>
  );
}
