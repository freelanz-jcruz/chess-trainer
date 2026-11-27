import { LEVEL_RATING, type Level } from './levels';
import curriculumJson from '@/content/curriculum.json';
import puzzleJson from '@/content/puzzles/puzzles.json';
import italiana from '@/content/openings/italiana-tranquila.json';
import espanola from '@/content/openings/espanola.json';
import espanolaCambio from '@/content/openings/espanola-cambio.json';
import e5 from '@/content/openings/e5-contra-e4.json';
import gdr from '@/content/openings/gambito-dama-rehusado.json';
import esquemaGdr from '@/content/openings/esquema-gdr.json';
import fegatello from '@/content/openings/fegatello.json';
import legal from '@/content/openings/legal.json';
import {
  curriculumSchema,
  lessonFileSchema,
  type LessonFile,
  openingSchema,
  puzzleFileSchema,
  type Curriculum,
  type Opening,
  type Puzzle,
} from './schemas';

import { LESSON_FILES } from '@/content/lessons';
import { CONTENT_TRANSLATIONS } from '@/content/i18n';
import { DEFAULT_LOCALE, getMessages, type Locale } from '@/lib/i18n';
import { applyPhrases } from './translations';
import { lessonRoute } from './links';
import { routeHref } from '@/lib/i18n/routes';

/** Registro de aperturas. Añadir una apertura = añadir su JSON aquí. */
const OPENING_FILES: unknown[] = [italiana, espanola, espanolaCambio, e5, gdr, esquemaGdr, fegatello, legal];

export const curriculum: Curriculum = curriculumSchema.parse(curriculumJson);
export const openings: Opening[] = OPENING_FILES.map((o) => openingSchema.parse(o));
export const puzzles: Puzzle[] = puzzleFileSchema.parse(puzzleJson).puzzles;

export const lessons: LessonFile[] = LESSON_FILES.map((l) => lessonFileSchema.parse(l));

export function getLesson(id: string): LessonFile | undefined {
  return lessons.find((l) => l.id === id);
}

/** Siguiente lección disponible del temario después de la lección `ref` (para encadenarlas). */
export function nextLessonAfter(ref: string, locale: Locale = DEFAULT_LOCALE): { href: string; title: string } | undefined {
  const all = curriculumIn(locale).blocks.flatMap((b) => b.lessons);
  const i = all.findIndex((l) => l.status === 'available' && 'ref' in l && l.ref === ref);
  if (i < 0) return undefined;
  for (const l of all.slice(i + 1)) {
    const route = lessonRoute(l);
    if (route) return { href: routeHref(locale, route), title: l.title };
  }
  return undefined;
}

export function getOpening(id: string): Opening | undefined {
  return openings.find((o) => o.id === id);
}

/** `level` null = «Todos»: problemas de cualquier nivel (la página los limita al nivel elegido). */
export type PuzzleSet = { id: string; title: string; themes: string[] | null; level: Level | null };

/** Cada lección de tipo "puzzles" del temario es un conjunto; "todos" los junta. */
export const puzzleSets: PuzzleSet[] = puzzleSetsIn(DEFAULT_LOCALE);

/** Los conjuntos de ejercicios con los títulos en `locale`. */
export function puzzleSetsIn(locale: Locale): PuzzleSet[] {
  return [
    { id: 'todos', title: getMessages(locale).pages.puzzles.all, themes: null, level: null },
    ...curriculumIn(locale).blocks.flatMap((b) =>
      b.lessons.flatMap((l) =>
        l.type === 'puzzles' && l.status === 'available'
          ? [{ id: l.id, title: l.title, themes: l.themes as string[], level: l.level }]
          : [],
      ),
    ),
  ];
}

/** Problemas de un conjunto: los de sus temas dentro del tramo de rating de su nivel. */
export function puzzlesForSet(set: PuzzleSet): Puzzle[] {
  const themes = set.themes;
  const range = set.level ? LEVEL_RATING[set.level] : null;
  return puzzles.filter(
    (p) => (!themes || p.themes.some((t) => themes.includes(t))) && (!range || (p.rating >= range.min && p.rating <= range.max)),
  );
}

export function puzzleIdsByLesson(): Record<string, string[]> {
  return Object.fromEntries(puzzleSets.map((s) => [s.id, puzzlesForSet(s).map((p) => p.id)]));
}

// ---------- Contenido en otros idiomas (ver lib/content/translations.ts) ----------

/** El temario en `locale` (lo no traducido sigue en español). */
export function curriculumIn(locale: Locale): Curriculum {
  return applyPhrases(curriculum, CONTENT_TRANSLATIONS[locale]?.curriculum);
}

/** Una lección en `locale`. */
export function lessonIn(lesson: LessonFile, locale: Locale): LessonFile {
  return applyPhrases(lesson, CONTENT_TRANSLATIONS[locale]?.lessons?.[lesson.id]);
}

/** Una apertura en `locale`. */
export function openingIn(opening: Opening, locale: Locale): Opening {
  return applyPhrases(opening, CONTENT_TRANSLATIONS[locale]?.openings?.[opening.id]);
}
