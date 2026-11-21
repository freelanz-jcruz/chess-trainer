import { Chess, type Move } from 'chess.js';
import type { Opening, OpeningBranch, OpeningStep } from '@/lib/content/schemas';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export type LinePly = {
  ply: number;
  san: string;
  uci: string;
  note?: string;
  fenBefore: string;
  fenAfter: string;
  color: 'w' | 'b';
  /** Otras jugadas aceptadas como correctas en este punto (SAN). */
  alternatives: string[];
  /** Ramas que parten de este paso (alternativas del rival u otras líneas). */
  branches: OpeningBranch[];
};

export function resolveStartFen(startFen: string): string {
  return startFen === 'startpos' ? START_FEN : startFen;
}

export function moveToUci(m: Pick<Move, 'from' | 'to' | 'promotion'>): string {
  return m.from + m.to + (m.promotion ?? '');
}

/**
 * Elige qué rama seguir en un paso. Devuelve la rama o null para seguir la línea principal.
 * Una rama sustituye a la jugada de ese paso y a todo lo que viene detrás.
 */
export type BranchPicker = (ply: number, step: OpeningStep) => OpeningBranch | null;

export const mainLineOnly: BranchPicker = () => null;

/**
 * Convierte una apertura (árbol) en una línea concreta de jugadas, comprobando la legalidad.
 * Lanza un error si alguna jugada es ilegal.
 */
export function buildLine(opening: Opening, pick: BranchPicker = mainLineOnly): LinePly[] {
  const chess = new Chess(resolveStartFen(opening.startFen));
  const out: LinePly[] = [];
  let steps: OpeningStep[] = opening.steps;
  let i = 0;
  let justBranched = false;
  while (i < steps.length) {
    const step = steps[i];
    const ply = out.length;
    // El primer paso de una rama recién elegida no vuelve a ofrecer ramas en el mismo medio movimiento.
    const branch = step.branches?.length && !justBranched ? pick(ply, step) : null;
    justBranched = false;
    if (branch) {
      steps = branch.steps;
      i = 0;
      justBranched = true;
      continue;
    }
    const fenBefore = chess.fen();
    let move: Move;
    try {
      move = chess.move(step.san);
    } catch {
      throw new Error(`Jugada ilegal "${step.san}" en el medio movimiento ${ply + 1} (${fenBefore})`);
    }
    out.push({
      ply,
      san: move.san,
      uci: moveToUci(move),
      note: step.note,
      fenBefore,
      fenAfter: chess.fen(),
      color: move.color,
      alternatives: steps === opening.steps ? (opening.alternatives[String(i)] ?? []) : [],
      branches: step.branches ?? [],
    });
    i++;
  }
  return out;
}

/** Recorre todas las líneas posibles del árbol (para el validador). */
export function allLines(opening: Opening): { path: string; line: LinePly[] }[] {
  const results: { path: string; line: LinePly[] }[] = [];
  const explore = (choices: Map<number, OpeningBranch | null>, path: string) => {
    let pendingPly: number | null = null;
    let pendingStep: OpeningStep | null = null;
    const line = buildLine(opening, (ply, step) => {
      if (choices.has(ply)) return choices.get(ply)!;
      if (pendingPly === null) {
        pendingPly = ply;
        pendingStep = step;
      }
      return null;
    });
    if (pendingPly === null || pendingStep === null) {
      results.push({ path, line });
      return;
    }
    const ply: number = pendingPly;
    const step: OpeningStep = pendingStep;
    explore(new Map(choices).set(ply, null), path);
    for (const b of step.branches ?? []) {
      explore(new Map(choices).set(ply, b), `${path} > ${b.name}`);
    }
  };
  explore(new Map(), 'Línea principal');
  return results;
}
