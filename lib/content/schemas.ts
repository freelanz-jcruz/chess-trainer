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
  /** Código ECO de la rama (lo comprueba `npm run eco` contra el catálogo de Lichess). */
  eco?: string;
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
    eco: z.string().regex(/^[A-E]\d\d$/).optional(),
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

export const PUZZLE_THEMES = ['mateIn1', 'mateIn2', 'hangingPiece', 'fork', 'pin', 'discoveredAttack'] as const;
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
  z.object({ ...lessonBase, type: z.literal('lesson'), status: z.literal('available'), ref: z.string() }),
  z.object({
    ...lessonBase,
    type: z.literal('puzzles'),
    status: z.literal('available'),
    themes: z.array(z.enum(PUZZLE_THEMES)).min(1),
  }),
  z.object({
    ...lessonBase,
    type: z.enum(['opening', 'puzzles', 'lesson']),
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

// ---------------------------------------------------------------------------
// Lecciones por páginas (fase 3): explicación, test, jugada, ejercicio de movimiento y juego.
// ---------------------------------------------------------------------------

const square = z.string().regex(/^[a-h][1-8]$/);
const color = z.enum(['white', 'black']);

/** Lo que muestra el tablero en una página. Las posiciones de solo texto pueden no tener reyes. */
const boardView = {
  fen: z.string().min(1).optional(),
  orientation: color.optional(),
  arrows: z.array(z.tuple([square, square])).optional(),
  highlight: z.array(square).optional(),
  /** Resalta automáticamente las casillas a las que puede ir la pieza de esa casilla. */
  showMovesFrom: square.optional(),
};

/** Texto breve con párrafos separados por línea en blanco y **negritas**. */
const body = z.string().min(1);

export const textPageSchema = z.object({ kind: z.literal('text'), title: z.string().optional(), body, ...boardView });

export const quizPageSchema = z.object({
  kind: z.literal('quiz'),
  body,
  ...boardView,
  options: z.array(z.string().min(1)).min(2).max(4),
  answer: z.number().int().min(0),
  explain: z.string().optional(),
});

/** Una jugada: de una lista (`listed`), cualquiera que Stockfish dé por buena (`good`) o cualquier mate (`mate`). */
export const movePageSchema = z.object({
  kind: z.literal('move'),
  body,
  fen: z.string().min(1),
  orientation: color.optional(),
  /** Jugada del rival (UCI) que se anima antes de que mueva el usuario. */
  opponentMove: uci.optional(),
  goal: z.enum(['listed', 'good', 'mate']),
  accept: z.array(z.string()).optional(),
  hint: z.string().optional(),
  success: z.string().optional(),
});

/** Ejercicio de movimiento: el rival no mueve. Sin reyes, para centrarse en la pieza. */
export const drillPageSchema = z.object({
  kind: z.literal('drill'),
  body,
  fen: z.string().min(1),
  goal: z.discriminatedUnion('type', [
    z.object({ type: z.literal('reach'), square }),
    z.object({ type: z.literal('captureAll') }),
  ]),
  /** Número de jugadas para hacerlo "perfecto" (lo comprueba el validador: es el mínimo posible). */
  par: z.number().int().min(1).optional(),
});

/** Partida contra Stockfish desde una posición hasta un objetivo. */
export const playPageSchema = z.object({
  kind: z.literal('play'),
  body,
  fen: z.string().min(1),
  orientation: color.optional(),
  opponentMove: uci.optional(),
  goal: z.enum(['checkmate', 'promote']),
  /** Máximo de jugadas del usuario. */
  maxMoves: z.number().int().min(1).optional(),
  /** Mate en N: cada jugada debe mantener un mate dentro del límite (si no, se deshace). */
  strict: z.boolean().default(false),
  hint: z.string().optional(),
});

export const lessonPageSchema = z.discriminatedUnion('kind', [
  textPageSchema,
  quizPageSchema,
  movePageSchema,
  drillPageSchema,
  playPageSchema,
]);
export type LessonPage = z.infer<typeof lessonPageSchema>;
export type TextPage = z.infer<typeof textPageSchema>;
export type QuizPage = z.infer<typeof quizPageSchema>;
export type MovePage = z.infer<typeof movePageSchema>;
export type DrillPage = z.infer<typeof drillPageSchema>;
export type PlayPage = z.infer<typeof playPageSchema>;

export const lessonFileSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  block: z.number().int().min(1).max(7),
  level: levelSchema.default('principiante'),
  summary: z.string().min(1),
  pages: z.array(lessonPageSchema).min(1),
});
export type LessonFile = z.infer<typeof lessonFileSchema>;
