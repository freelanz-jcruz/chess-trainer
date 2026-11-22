import { Chess, SQUARES, type Square } from 'chess.js';

export type Color = 'white' | 'black';

/**
 * Crea una partida sin validar el FEN: así se admiten posiciones didácticas sin reyes
 * (p. ej. una torre sola). La validez de las posiciones de juego la garantiza el validador.
 */
export const makeChess = (fen: string) => new Chess(fen, { skipValidation: true });

export const turnColor = (fen: string): Color => (fen.split(' ')[1] === 'w' ? 'white' : 'black');
export const opposite = (c: Color): Color => (c === 'white' ? 'black' : 'white');

/** Casillas de destino legales para Chessground. */
export function legalDests(fen: string): Map<Square, Square[]> {
  const chess = makeChess(fen);
  const dests = new Map<Square, Square[]>();
  for (const s of SQUARES) {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length) dests.set(s, ms.map((m) => m.to));
  }
  return dests;
}

/** Destinos de la pieza de una casilla, aunque no sea su turno (para explicar cómo se mueve). */
export function movesFrom(fen: string, square: string): Square[] {
  const piece = makeChess(fen).get(square as Square);
  if (!piece) return [];
  const parts = fen.split(' ');
  parts[1] = piece.color;
  parts[3] = '-';
  return makeChess(parts.join(' '))
    .moves({ square: square as Square, verbose: true })
    .map((m) => m.to);
}

export function isPromotion(fen: string, from: string, to: string): boolean {
  const piece = makeChess(fen).get(from as Square);
  return piece?.type === 'p' && (to[1] === '8' || to[1] === '1');
}

export type PlayedMove = {
  uci: string;
  san: string;
  fenAfter: string;
  isCheckmate: boolean;
  isStalemate: boolean;
  captured: boolean;
  promotion: boolean;
};

/** Aplica una jugada UCI. Devuelve null si es ilegal. */
export function playUci(fen: string, uci: string): PlayedMove | null {
  const chess = makeChess(fen);
  try {
    const m = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    return {
      uci,
      san: m.san,
      fenAfter: chess.fen(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      captured: Boolean(m.captured),
      promotion: Boolean(m.promotion),
    };
  } catch {
    return null;
  }
}

/** Convierte una jugada del tablero (origen/destino) a UCI, coronando a `promo` si hace falta. */
export function toUci(fen: string, from: string, to: string, promo = 'q'): string {
  return from + to + (isPromotion(fen, from, to) ? promo : '');
}

/** Devuelve el turno al bando indicado (ejercicios en los que el rival no mueve). */
export function withTurn(fen: string, c: Color): string {
  const parts = fen.split(' ');
  parts[1] = c === 'white' ? 'w' : 'b';
  parts[3] = '-';
  return parts.join(' ');
}

export const uciToSquares = (uci: string): [Square, Square] => [uci.slice(0, 2) as Square, uci.slice(2, 4) as Square];

export const isInCheck = (fen: string) => {
  try {
    return makeChess(fen).inCheck();
  } catch {
    return false; // posiciones sin rey
  }
};

/** Convierte SAN a UCI en una posición; null si es ilegal. */
export function sanToUci(fen: string, san: string): string | null {
  try {
    const m = makeChess(fen).move(san);
    return m.from + m.to + (m.promotion ?? '');
  } catch {
    return null;
  }
}
