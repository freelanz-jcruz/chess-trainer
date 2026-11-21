import type { Engine, Analysis, AnalyzeOptions } from './engine';
import { assessMove, negate, type Assessment } from './evaluate';
import type { Score } from './uci';

/** Puntuación tras la jugada, desde el punto de vista de quien la hizo. */
export function scoreForMover(after: Analysis): Score {
  // Mate 0 = el que debe mover está mateado => quien movió dio mate.
  if (after.score.type === 'mate' && after.score.value === 0) return { type: 'mate', value: 1 };
  return negate(after.score);
}

/**
 * Valora la jugada que lleva de `before` a `fenAfter`.
 * `before` puede venir ya calculado (análisis lanzado mientras el usuario pensaba).
 */
export async function evaluateMove(
  engine: Engine,
  before: Analysis,
  fenAfter: string,
  opts: AnalyzeOptions,
): Promise<Assessment & { best: Analysis }> {
  const after = await engine.analyze(fenAfter, opts);
  return { ...assessMove(before.score, scoreForMover(after)), best: before };
}
