import { makeChess, withTurn, turnColor } from './game';
import type { DrillPage } from '@/lib/content/schemas';

/** Estado de un ejercicio de movimiento: solo importa la colocación de las piezas. */
const placement = (fen: string) => fen.split(' ')[0];

export function drillDone(page: DrillPage, fen: string): boolean {
  const chess = makeChess(fen);
  const me = turnColor(page.fen) === 'white' ? 'w' : 'b';
  if (page.goal.type === 'reach') {
    const p = chess.get(page.goal.square as never);
    return Boolean(p && p.color === me);
  }
  // captureAll: no queda ninguna pieza del rival
  return chess.board().every((row) => row.every((sq) => !sq || sq.color === me));
}

/**
 * Camino más corto (en jugadas UCI) hasta cumplir el objetivo, con búsqueda en anchura.
 * El rival no mueve: tras cada jugada se devuelve el turno al usuario. null si es imposible.
 */
export function shortestDrill(page: DrillPage, fen: string, limit = 12): string[] | null {
  const me = turnColor(page.fen);
  const start = withTurn(fen, me);
  if (drillDone(page, start)) return [];
  const seen = new Set([placement(start)]);
  let frontier: { fen: string; path: string[] }[] = [{ fen: start, path: [] }];
  for (let depth = 1; depth <= limit && frontier.length; depth++) {
    const next: typeof frontier = [];
    for (const node of frontier) {
      for (const m of makeChess(node.fen).moves({ verbose: true })) {
        const c = makeChess(node.fen);
        c.move(m);
        const after = withTurn(c.fen(), me);
        const key = placement(after);
        if (seen.has(key)) continue;
        seen.add(key);
        const path = [...node.path, m.from + m.to + (m.promotion ?? '')];
        if (drillDone(page, after)) return path;
        next.push({ fen: after, path });
      }
    }
    frontier = next;
  }
  return null;
}
