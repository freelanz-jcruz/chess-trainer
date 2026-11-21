import { describe, expect, it } from 'vitest';
import { allLines, buildLine } from '@/lib/chess/opening-line';
import { openingSchema } from '@/lib/content/schemas';
import italiana from '@/content/openings/italiana-tranquila.json';

describe('buildLine', () => {
  it('reproduce la Italiana con jugadas legales', () => {
    const line = buildLine(openingSchema.parse(italiana));
    expect(line[0].san).toBe('e4');
    expect(line[4].uci).toBe('f1c4');
    expect(line.every((p) => p.fenAfter !== p.fenBefore)).toBe(true);
  });

  it('admite ramas y las recorre todas', () => {
    const op = openingSchema.parse({
      id: 'prueba', name: 'Prueba', side: 'white', block: 5, summary: 'x',
      steps: [
        { san: 'e4' }, { san: 'e5' }, { san: 'Nf3' }, { san: 'Nc6' }, { san: 'Bb5' },
        {
          san: 'a6',
          branches: [
            { id: 'berlinesa', name: 'Berlinesa', steps: [{ san: 'Nf6' }, { san: 'O-O' }] },
            { id: 'steinitz', name: 'Steinitz', steps: [{ san: 'd6' }, { san: 'd4', branches: [{ id: 'sub', name: 'Sub', steps: [{ san: 'c3' }] }] }] },
          ],
        },
        { san: 'Ba4' },
      ],
    });
    const lines = allLines(op);
    expect(lines.map((l) => l.path)).toEqual([
      'Línea principal',
      'Línea principal > Berlinesa',
      'Línea principal > Steinitz',
      'Línea principal > Steinitz > Sub',
    ]);
    expect(lines[1].line.map((p) => p.san).slice(-2)).toEqual(['Nf6', 'O-O']);
    expect(lines[2].line.map((p) => p.san).slice(-2)).toEqual(['d6', 'd4']);
    expect(lines[3].line.map((p) => p.san).slice(-2)).toEqual(['d6', 'c3']);
  });

  it('detecta jugadas ilegales', () => {
    const op = openingSchema.parse({ id: 'mal', name: 'Mal', side: 'white', block: 5, summary: 'x', steps: [{ san: 'e5' }] });
    expect(() => buildLine(op)).toThrow(/ilegal/);
  });
});
