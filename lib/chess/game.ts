import { Chess, SQUARES, type Square } from 'chess.js';

export type Color = 'white' | 'black';

export const turnColor = (fen: string): Color => (fen.split(' ')[1] === 'w' ? 'white' : 'black');
export const opposite = (c: Color): Color => (c === 'white' ? 'black' : 'white');

/** Casillas de destino legales para Chessground. */
export function legalDests(fen: string): Map<Square, Square[]> {
  const chess = new Chess(fen);
  const dests = new Map<Square, Square[]>();
  for (const s of SQUARES) {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length) dests.set(s, ms.map((m) => m.to));
  }
  return dests;
}

export function isPromotion(fen: string, from: string, to: string): boolean {
  const piece = new Chess(fen).get(from as Square);
  return piece?.type === 'p' && (to[1] === '8' || to[1] === '1');
}

export type PlayedMove = { uci: string; san: string; fenAfter: string; isCheckmate: boolean };

/** Aplica una jugada UCI. Devuelve null si es ilegal. */
export function playUci(fen: string, uci: string): PlayedMove | null {
  const chess = new Chess(fen);
  try {
    const m = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    return { uci, san: m.san, fenAfter: chess.fen(), isCheckmate: chess.isCheckmate() };
  } catch {
    return null;
  }
}

/** Convierte una jugada del tablero (origen/destino) a UCI, coronando a `promo` si hace falta. */
export function toUci(fen: string, from: string, to: string, promo = 'q'): string {
  return from + to + (isPromotion(fen, from, to) ? promo : '');
}

export const uciToSquares = (uci: string): [Square, Square] => [uci.slice(0, 2) as Square, uci.slice(2, 4) as Square];

export const isInCheck = (fen: string) => new Chess(fen).inCheck();
