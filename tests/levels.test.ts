import { describe, expect, it } from 'vitest';
import { allLines } from '@/lib/chess/opening-line';
import { levelAllows, openingForLevel } from '@/lib/content/levels';
import { openingSchema } from '@/lib/content/schemas';
import { normalizeProgress } from '@/lib/progress/store';

describe('niveles', () => {
  it('cada nivel incluye los anteriores', () => {
    expect(levelAllows('principiante', 'principiante')).toBe(true);
    expect(levelAllows('principiante', 'intermedio')).toBe(false);
    expect(levelAllows('intermedio', 'principiante')).toBe(true);
    expect(levelAllows('intermedio', 'avanzado')).toBe(false);
    expect(levelAllows('avanzado', 'intermedio')).toBe(true);
    // Sin nivel declarado cuenta como principiante.
    expect(levelAllows('principiante')).toBe(true);
  });

  it('el ajuste de nivel por defecto es principiante y uno desconocido vuelve a él', () => {
    const base = { version: 1, openings: {}, puzzles: {}, lessons: {}, reviews: {} };
    expect(normalizeProgress({ ...base })?.settings.level).toBe('principiante');
    expect(normalizeProgress({ ...base, settings: { level: 'avanzado' } })?.settings.level).toBe('avanzado');
    expect(normalizeProgress({ ...base, settings: { level: 'maestro' } })?.settings.level).toBe('principiante');
  });
});

describe('variantes por nivel', () => {
  // 1.e4 e5 2.Cf3 Cc6 3.Ac4 (principal) / 3.Ab5 (intermedio, con una subrama avanzada) / 3.d4 (sin nivel).
  const opening = openingSchema.parse({
    id: 'prueba',
    name: 'Prueba',
    side: 'white',
    block: 5,
    summary: 'Apertura de prueba.',
    steps: [
      { san: 'e4' },
      { san: 'e5' },
      { san: 'Nf3' },
      { san: 'Nc6' },
      {
        san: 'Bc4',
        branches: [
          {
            id: 'espanola',
            name: 'Española',
            level: 'intermedio',
            steps: [{ san: 'Bb5' }, { san: 'a6', branches: [{ id: 'marshall', name: 'Avanzada', level: 'avanzado', steps: [{ san: 'Nf6' }] }] }],
          },
          { id: 'escocesa', name: 'Escocesa', steps: [{ san: 'd4' }] },
        ],
      },
    ],
  });
  const names = (level: 'principiante' | 'intermedio' | 'avanzado') =>
    allLines(openingForLevel(opening, level)).map((l) => l.path);

  it('principiante solo ve la principal y las ramas sin nivel', () => {
    expect(names('principiante')).toEqual(['Línea principal', 'Línea principal > Escocesa']);
  });

  it('intermedio añade sus ramas, pero no las avanzadas que contienen', () => {
    expect(names('intermedio')).toEqual(['Línea principal', 'Línea principal > Española', 'Línea principal > Escocesa']);
  });

  it('avanzado lo ve todo', () => {
    expect(names('avanzado')).toHaveLength(4);
    expect(names('avanzado')).toContain('Línea principal > Española > Avanzada');
  });

  it('no modifica la apertura original', () => {
    openingForLevel(opening, 'principiante');
    expect(allLines(opening)).toHaveLength(4);
  });
});
