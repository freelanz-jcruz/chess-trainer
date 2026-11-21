import { z } from 'zod';

export const LEVELS = ['principiante', 'intermedio', 'avanzado'] as const;
export const levelSchema = z.enum(LEVELS);

export const MAX_NOTE_LENGTH = 140;

/** Un paso de una apertura: una jugada en SAN inglesa (la de chess.js) y una nota breve opcional. */
export type OpeningStep = {
  san: string;
  note?: string;
  branches?: OpeningBranch[];
};

/**
 * Una rama sustituye al paso donde se declara y a todo lo que sigue.
 * Las ramas declaradas en el primer paso de otra rama se ignoran (serían ramas hermanas):
 * el validador lo señala como error.
 */
export type OpeningBranch = {
  id: string;
  name: string;
  level?: z.infer<typeof levelSchema>;
  steps: OpeningStep[];
};

export const openingStepSchema: z.ZodType<OpeningStep> = z.lazy(() =>
  z.object({
    san: z.string().min(1),
    note: z.string().min(1).optional(),
    branches: z.array(openingBranchSchema).optional(),
  }),
);

export const openingBranchSchema: z.ZodType<OpeningBranch> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    level: levelSchema.optional(),
    steps: z.array(openingStepSchema).min(1),
  }),
);

export const openingSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  eco: z.string().regex(/^[A-E]\d\d$/).optional(),
  side: z.enum(['white', 'black']),
  kind: z.enum(['repertoire', 'trap']).default('repertoire'),
  block: z.number().int().min(1).max(7),
  level: levelSchema.default('principiante'),
  summary: z.string().min(1),
  startFen: z.string().default('startpos'),
  steps: z.array(openingStepSchema).min(1),
  /** Índice de paso (desde 0) -> otras jugadas aceptadas como correctas (transposiciones). */
  alternatives: z.record(z.string().regex(/^\d+$/), z.array(z.string())).default({}),
});
export type Opening = z.infer<typeof openingSchema>;

export const PUZZLE_THEMES = ['mateIn1', 'mateIn2', 'hangingPiece', 'fork'] as const;
export type PuzzleTheme = (typeof PUZZLE_THEMES)[number];

const uci = z.string().regex(/^[a-h][1-8][a-h][1-8][qrbn]?$/);

export const puzzleSchema = z.object({
  id: z.string().min(1),
  /** Posición ANTES de la jugada del rival (igual que en el CSV de Lichess). */
  fen: z.string().min(1),
  /** Primera jugada del CSV: la hace el rival antes de que el usuario empiece. */
  opponentMove: uci,
  /** Resto de jugadas: usuario, rival, usuario... */
  solution: z.array(uci).min(1),
  rating: z.number().int(),
  themes: z.array(z.string()).min(1),
});
export type Puzzle = z.infer<typeof puzzleSchema>;

export const puzzleFileSchema = z.object({
  source: z.string(),
  generated: z.string(),
  puzzles: z.array(puzzleSchema),
});

const lessonBase = {
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  level: levelSchema.default('principiante'),
};

export const lessonSchema = z.union([
  z.object({ ...lessonBase, type: z.literal('opening'), status: z.literal('available'), ref: z.string() }),
  z.object({
    ...lessonBase,
    type: z.literal('puzzles'),
    status: z.literal('available'),
    themes: z.array(z.enum(PUZZLE_THEMES)).min(1),
  }),
  z.object({
    ...lessonBase,
    type: z.enum(['opening', 'puzzles', 'explanation', 'task', 'vsEngine']),
    status: z.literal('soon'),
  }),
]);
export type Lesson = z.infer<typeof lessonSchema>;

export const curriculumSchema = z.object({
  blocks: z.array(
    z.object({
      id: z.number().int().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      lessons: z.array(lessonSchema),
    }),
  ),
});
export type Curriculum = z.infer<typeof curriculumSchema>;
