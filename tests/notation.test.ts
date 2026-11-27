import { describe, expect, it } from 'vitest';
import { formatMoveList, formatSan, sanToEs } from '@/lib/chess/notation';

describe('sanToEs', () => {
  it('traduce piezas, enroques y coronaciones', () => {
    expect(sanToEs('Nf3')).toBe('Cf3');
    expect(sanToEs('Bxc6+')).toBe('Axc6+');
    expect(sanToEs('Qh5#')).toBe('Dh5#');
    expect(sanToEs('Kxe2')).toBe('Rxe2');
    expect(sanToEs('Rae1')).toBe('Tae1');
    expect(sanToEs('O-O')).toBe('0-0');
    expect(sanToEs('O-O-O+')).toBe('0-0-0+');
    expect(sanToEs('exd8=Q+')).toBe('exd8=D+');
    expect(sanToEs('e4')).toBe('e4');
  });
  it('formatea listas con números de jugada', () => {
    expect(formatMoveList(['e4', 'e5', 'Nf3'])).toBe('1.e4 e5 2.Cf3');
    expect(formatMoveList(['Nc6', 'Bc4'], 3)).toBe('2...Cc6 3.Ac4');
  });
});

describe('notación en inglés', () => {
  it('deja la SAN tal cual', () => {
    expect(formatSan('Nf3', 'en')).toBe('Nf3');
    expect(formatSan('exd8=Q+', 'en')).toBe('exd8=Q+');
    expect(formatSan('O-O-O', 'en')).toBe('O-O-O');
    expect(formatMoveList(['e4', 'e5', 'Nf3'], 0, 'en')).toBe('1.e4 e5 2.Nf3');
  });
});
