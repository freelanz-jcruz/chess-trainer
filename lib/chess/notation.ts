import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';

/**
 * Letras de las piezas por idioma (rey, dama, torre, alfil, caballo). Internamente todo va en SAN inglesa
 * (la de chess.js); esto solo cambia lo que se muestra. En inglés serían las mismas: K, Q, R, B, N.
 */
const PIECE_LETTERS: Record<Locale, Record<'K' | 'Q' | 'R' | 'B' | 'N', string>> = {
  es: { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' },
};

/** SAN inglesa → notación del idioma, p. ej. «Nf3» → «Cf3» y «O-O» → «0-0». Solo para mostrar. */
export function formatSan(san: string, locale: Locale = DEFAULT_LOCALE): string {
  const letters = PIECE_LETTERS[locale];
  if (san.startsWith('O-O-O')) return '0-0-0' + san.slice(5);
  if (san.startsWith('O-O')) return '0-0' + san.slice(3);
  // Pieza inicial y pieza de coronación (=Q).
  return san
    .replace(/^[KQRBN]/, (p) => letters[p as keyof typeof letters])
    .replace(/=([QRBN])/, (_, p: string) => '=' + letters[p as keyof typeof letters]);
}

/** «1.e4 e5 2.Cf3» a partir de una lista de SAN, empezando en el número de jugada dado. */
export function formatMoveList(sans: string[], startPly = 0, locale: Locale = DEFAULT_LOCALE): string {
  return sans
    .map((san, i) => {
      const ply = startPly + i;
      const shown = formatSan(san, locale);
      if (ply % 2 === 0) return `${ply / 2 + 1}.${shown}`;
      return i === 0 ? `${Math.floor(ply / 2) + 1}...${shown}` : shown;
    })
    .join(' ');
}

/** Atajo en español para los scripts (validador) y los textos generados al compilar. */
export const sanToEs = (san: string) => formatSan(san, 'es');
