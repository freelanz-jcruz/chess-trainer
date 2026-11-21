import type { Score } from './uci';

export type Verdict = 'correct' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export const VERDICT_LABEL: Record<Verdict, string> = {
  correct: 'Correcta',
  good: 'Buena alternativa',
  inaccuracy: 'Imprecisión',
  mistake: 'Error',
  blunder: 'Error grave',
};

/** Las evaluaciones normales se acotan para no inventar pérdidas en posiciones ya ganadas. */
const CP_CLAMP = 15;

/** Convierte una puntuación a peones desde el punto de vista del bando indicado. */
export function scoreToPawns(score: Score): number {
  if (score.type === 'mate') {
    if (score.value === 0) return -100; // el bando que mueve está mateado
    const n = Math.abs(score.value);
    return Math.sign(score.value) * (100 - n);
  }
  return Math.max(-CP_CLAMP, Math.min(CP_CLAMP, score.value / 100));
}

/** Niega una puntuación (cambiar de punto de vista). */
export function negate(score: Score): Score {
  return { type: score.type, value: -score.value } as Score;
}

/** true si la puntuación (desde el punto de vista de quien movió) indica que el rival tiene mate forzado. */
export function opponentHasMate(scoreForMover: Score): boolean {
  return scoreForMover.type === 'mate' && scoreForMover.value < 0;
}

export type Assessment = {
  verdict: Verdict;
  /** Pérdida en peones. Es null cuando hay un mate de por medio (la cifra no significaría nada). */
  loss: number | null;
  /** Motivo especial: deja escapar un mate propio o permite uno del rival. */
  reason?: 'missesMate' | 'allowsMate';
};

/**
 * Clasifica una jugada que NO es la esperada.
 * @param best  evaluación de la posición antes de mover (punto de vista de quien mueve)
 * @param after evaluación tras la jugada, ya desde el punto de vista de quien movió
 */
export function assessMove(best: Score, after: Score): Assessment {
  // Si antes y después hay mate forzado a favor del mismo bando, el resultado no cambia:
  // tardar una jugada más en dar (o recibir) mate no se penaliza.
  const sameMate = best.type === 'mate' && after.type === 'mate' && Math.sign(best.value) === Math.sign(after.value);
  const loss = sameMate ? 0 : Math.max(0, scoreToPawns(best) - scoreToPawns(after));
  const allowsMate = opponentHasMate(after) && !opponentHasMate(best);
  const missesMate = best.type === 'mate' && best.value > 0 && !(after.type === 'mate' && after.value > 0);
  let verdict: Verdict;
  if (allowsMate || loss > 3) verdict = 'blunder';
  else if (loss >= 1) verdict = 'mistake';
  else if (loss >= 0.5) verdict = 'inaccuracy';
  else verdict = 'good';
  const reason = allowsMate ? 'allowsMate' : missesMate ? 'missesMate' : undefined;
  const involvesMate = best.type === 'mate' || after.type === 'mate';
  return { verdict, loss: involvesMate ? null : Math.round(loss * 100) / 100, reason };
}

export function isAcceptable(v: Verdict): boolean {
  return v === 'correct' || v === 'good';
}
