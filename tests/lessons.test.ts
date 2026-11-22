import { describe, expect, it } from 'vitest';
import { drillDone, shortestDrill } from '@/lib/chess/drill';
import { movesFrom, playUci, withTurn } from '@/lib/chess/game';
import { drillPageSchema, lessonFileSchema } from '@/lib/content/schemas';
import { LESSON_FILES } from '@/content/lessons';

const drill = (fen: string, goal: object) => drillPageSchema.parse({ kind: 'drill', body: 'x', fen, goal });

describe('ejercicios de movimiento', () => {
  it('calcula el camino más corto de la torre', () => {
    const page = drill('8/8/8/8/8/8/8/R7 w - - 0 1', { type: 'reach', square: 'h8' });
    expect(shortestDrill(page, page.fen)?.length).toBe(2);
  });
  it('captura todos los peones con el mínimo de jugadas', () => {
    const page = drill('3p3p/8/8/p2p4/8/8/8/R7 w - - 0 1', { type: 'captureAll' });
    const path = shortestDrill(page, page.fen)!;
    expect(path.length).toBe(4);
    let fen = page.fen;
    for (const uci of path) fen = withTurn(playUci(fen, uci)!.fenAfter, 'white');
    expect(drillDone(page, fen)).toBe(true);
  });
  it('el caballo necesita 3 saltos de b1 a e5', () => {
    const page = drill('8/8/8/8/8/8/8/1N6 w - - 0 1', { type: 'reach', square: 'e5' });
    expect(shortestDrill(page, page.fen)?.length).toBe(3);
  });
});

describe('utilidades', () => {
  it('movesFrom funciona sin reyes y aunque no sea su turno', () => {
    expect(movesFrom('8/8/8/8/3N4/8/8/8 b - - 0 1', 'd4').sort()).toEqual(['b3', 'b5', 'c2', 'c6', 'e2', 'e6', 'f3', 'f5']);
  });
  it('detecta ahogado y coronación', () => {
    expect(playUci('7k/8/5QK1/8/8/8/8/8 w - - 0 1', 'f6f7')?.isStalemate).toBe(true);
    expect(playUci('4k3/1P6/8/8/8/8/8/4K3 w - - 0 1', 'b7b8n')).toMatchObject({ promotion: true, san: 'b8=N' });
  });
});

describe('contenido', () => {
  it('todas las lecciones cumplen el esquema', () => {
    for (const l of LESSON_FILES) expect(() => lessonFileSchema.parse(l)).not.toThrow();
  });
});
