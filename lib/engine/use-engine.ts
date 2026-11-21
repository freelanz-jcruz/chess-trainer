'use client';
import { useCallback, useEffect, useRef } from 'react';
import type { Analysis } from './engine';
import { getEngine } from './browser';
import { evaluateMove } from './evaluate-move';

/**
 * Hook para valorar jugadas. `preAnalyze` se llama en cuanto le toca al usuario, para que la
 * evaluación de referencia ya esté (o casi) cuando mueva.
 */
export function useMoveEvaluator(movetime: number) {
  const pending = useRef<{ fen: string; promise: Promise<Analysis> } | null>(null);

  useEffect(() => () => getEngine().cancelAll(), []);

  const preAnalyze = useCallback(
    (fen: string) => {
      if (pending.current?.fen === fen) return;
      pending.current = { fen, promise: getEngine().analyze(fen, { movetime }) };
      pending.current.promise.catch(() => {});
    },
    [movetime],
  );

  const evaluate = useCallback(
    async (fenBefore: string, fenAfter: string) => {
      preAnalyze(fenBefore);
      const before = await pending.current!.promise;
      return evaluateMove(getEngine(), before, fenAfter, { movetime });
    },
    [movetime, preAnalyze],
  );

  /** Descarta los análisis en curso (p. ej. cuando el usuario acierta y no hace falta valorar). */
  const cancel = useCallback(() => {
    pending.current = null;
    getEngine().cancelAll();
  }, []);

  return { preAnalyze, evaluate, cancel };
}
