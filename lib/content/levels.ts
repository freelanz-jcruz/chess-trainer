import { LEVELS, type Level, type Opening, type OpeningBranch, type OpeningStep } from './schemas';

export type { Level };
export { LEVELS };

/**
 * Tramo de rating (Lichess) de los ejercicios de cada nivel. Los de principiante son los de siempre
 * (400–1400): los tramos no se solapan, así que un conjunto de un nivel nunca muestra problemas de otro.
 */
export const LEVEL_RATING: Record<Level, { min: number; max: number }> = {
  principiante: { min: 0, max: 1400 },
  intermedio: { min: 1401, max: 1900 },
  avanzado: { min: 1901, max: 9999 },
};

export const LEVEL_LABEL: Record<Level, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

/** El nivel elegido muestra su contenido y el de los niveles anteriores. Sin nivel = principiante. */
export function levelAllows(selected: Level, content: Level = 'principiante'): boolean {
  return LEVELS.indexOf(content) <= LEVELS.indexOf(selected);
}

/**
 * Copia de la apertura sin las ramas por encima del nivel elegido. Una rama sin `level` hereda el de la
 * rama o apertura que la contiene. Así el recorrido, la práctica y el selector de variantes funcionan
 * igual, solo con las ramas visibles.
 */
export function openingForLevel(opening: Opening, selected: Level): Opening {
  const filterSteps = (steps: OpeningStep[], inherited: Level): OpeningStep[] =>
    steps.map((step) => {
      if (!step.branches) return step;
      const branches = step.branches
        .filter((b) => levelAllows(selected, b.level ?? inherited))
        .map((b): OpeningBranch => ({ ...b, steps: filterSteps(b.steps, b.level ?? inherited) }));
      return { ...step, branches: branches.length ? branches : undefined };
    });
  return { ...opening, steps: filterSteps(opening.steps, opening.level) };
}
