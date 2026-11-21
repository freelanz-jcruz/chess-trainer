/** Traduce SAN inglesa (K Q R B N) a notación española (R D T A C). Solo para mostrar. */
const PIECES: Record<string, string> = { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' };

export function sanToEs(san: string): string {
  if (san.startsWith('O-O-O')) return '0-0-0' + san.slice(5);
  if (san.startsWith('O-O')) return '0-0' + san.slice(3);
  // Pieza inicial y pieza de coronación (=Q).
  return san
    .replace(/^[KQRBN]/, (p) => PIECES[p])
    .replace(/=([QRBN])/, (_, p: string) => '=' + PIECES[p]);
}

/** "1.e4 e5 2.Cf3" a partir de una lista de SAN, empezando en el número de jugada dado. */
export function formatMoveList(sans: string[], startPly = 0): string {
  return sans
    .map((san, i) => {
      const ply = startPly + i;
      const es = sanToEs(san);
      if (ply % 2 === 0) return `${ply / 2 + 1}.${es}`;
      return i === 0 ? `${Math.floor(ply / 2) + 1}...${es}` : es;
    })
    .join(' ');
}
