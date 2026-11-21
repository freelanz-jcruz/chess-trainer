import curriculumJson from '@/content/curriculum.json';
import puzzleJson from '@/content/puzzles/puzzles.json';
import italiana from '@/content/openings/italiana-tranquila.json';
import {
  curriculumSchema,
  openingSchema,
  puzzleFileSchema,
  type Curriculum,
  type Opening,
  type Puzzle,
} from './schemas';

/** Registro de aperturas. Añadir una apertura = añadir su JSON aquí. */
const OPENING_FILES: unknown[] = [italiana];

export const curriculum: Curriculum = curriculumSchema.parse(curriculumJson);
export const openings: Opening[] = OPENING_FILES.map((o) => openingSchema.parse(o));
export const puzzles: Puzzle[] = puzzleFileSchema.parse(puzzleJson).puzzles;

export function getOpening(id: string): Opening | undefined {
  return openings.find((o) => o.id === id);
}

export type PuzzleSet = { id: string; title: string; themes: string[] | null };

/** Cada lección de tipo "puzzles" del temario es un conjunto; "todos" los junta. */
export const puzzleSets: PuzzleSet[] = [
  { id: 'todos', title: 'Todos', themes: null },
  ...curriculum.blocks.flatMap((b) =>
    b.lessons.flatMap((l) =>
      l.type === 'puzzles' && l.status === 'available' ? [{ id: l.id, title: l.title, themes: l.themes as string[] }] : [],
    ),
  ),
];

export function puzzlesForSet(set: PuzzleSet): Puzzle[] {
  const themes = set.themes;
  return themes ? puzzles.filter((p) => p.themes.some((t) => themes.includes(t))) : puzzles;
}

export function puzzleIdsByLesson(): Record<string, string[]> {
  return Object.fromEntries(puzzleSets.map((s) => [s.id, puzzlesForSet(s).map((p) => p.id)]));
}
