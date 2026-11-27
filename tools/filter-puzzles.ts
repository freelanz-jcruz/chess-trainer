/**
 * Filtra la base de problemas de Lichess (CC0) y genera content/puzzles/puzzles.json.
 *
 * Uso:
 *   npm run puzzles -- --input tools/data/lichess_db_puzzle.csv.zst [--per-theme 100]
 *     [--min-rating 400] [--max-rating 1400] [--min-popularity 90] [--min-plays 500] [--max-rd 100]
 *     Problemas de principiante (los seis temas iniciales). Conserva los de niveles superiores ya guardados.
 *
 *   npm run puzzles -- --add [--per-set 60]
 *     Niveles superiores: para cada conjunto del temario de nivel intermedio o avanzado (sus temas y el tramo
 *     de rating de su nivel, ver lib/content/levels.ts) añade problemas hasta tener `per-set`, sin tocar los
 *     que ya hay. Un conjunto nuevo en el temario solo necesita volver a ejecutar esto.
 *
 * Requiere el comando `zstd` (brew install zstd / apt install zstd) si la entrada está comprimida.
 *
 * ¡Ojo! En el CSV, FEN es la posición ANTES de la primera jugada de Moves, y esa jugada es del rival.
 */
import { spawn } from 'node:child_process';
import { createReadStream, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';
import { Chess } from 'chess.js';
import { LEVEL_RATING } from '../lib/content/levels';
import { curriculumSchema, puzzleFileSchema, type Puzzle, type PuzzleTheme } from '../lib/content/schemas';
import curriculumJson from '../content/curriculum.json';

function arg(name: string, def?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (def === undefined) {
    console.error(`Falta el argumento --${name}`);
    process.exit(1);
  }
  return def;
}

const input = arg('input', 'tools/data/lichess_db_puzzle.csv.zst');
const output = arg('output', 'content/puzzles/puzzles.json');
const perTheme = Number(arg('per-theme', '100'));
const minRating = Number(arg('min-rating', '400'));
const maxRating = Number(arg('max-rating', '1400'));
const minPopularity = Number(arg('min-popularity', '90'));
const minPlays = Number(arg('min-plays', '500'));
const maxRd = Number(arg('max-rd', '100'));
const seed = arg('seed', 'chess-trainer');
const addMode = process.argv.includes('--add');
const perSet = Number(arg('per-set', '60'));

/** Temas de principiante (modo por defecto). */
const BEGINNER_THEMES: PuzzleTheme[] = ['mateIn1', 'mateIn2', 'hangingPiece', 'fork', 'pin', 'discoveredAttack'];

/** Tramos de rating para repartir la dificultad de forma equilibrada. */
const BUCKETS = 4;
const bucketOf = (rating: number) =>
  Math.min(BUCKETS - 1, Math.floor(((rating - minRating) / (maxRating - minRating + 1)) * BUCKETS));
const perBucket = Math.ceil(perTheme / BUCKETS);

/** Prioridad para asignar cada problema a un único tema (evita duplicados). */
// Los temas nuevos van al final para no cambiar los problemas ya elegidos de los anteriores.
const PRIORITY: PuzzleTheme[] = ['mateIn1', 'mateIn2', 'fork', 'hangingPiece', 'pin', 'discoveredAttack'];

/** Orden pseudoaleatorio estable: hash(semilla + id). Independiente del orden del fichero. */
const rank = (id: string) => createHash('sha1').update(seed + id).digest().readUInt32BE(0);

type Candidate = { rank: number; row: Puzzle };
// tema -> tramo -> mejores candidatos (los de menor rank), como mucho perBucket
const pools = new Map<PuzzleTheme, Candidate[][]>(
  BEGINNER_THEMES.map((t) => [t, Array.from({ length: BUCKETS }, () => [])]),
);

function offer(theme: PuzzleTheme, bucket: number, c: Candidate) {
  const pool = pools.get(theme)![bucket];
  if (pool.length < perBucket) {
    pool.push(c);
    return;
  }
  let worst = 0;
  for (let i = 1; i < pool.length; i++) if (pool[i].rank > pool[worst].rank) worst = i;
  if (c.rank < pool[worst].rank) pool[worst] = c;
}

/** Comprueba que todas las jugadas son legales y que el problema tiene la forma esperada. */
function isPlayable(fen: string, moves: string[]): boolean {
  try {
    const chess = new Chess(fen);
    for (const m of moves) {
      chess.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] });
    }
    return true;
  } catch {
    return false;
  }
}

function openInput(path: string): NodeJS.ReadableStream {
  if (!path.endsWith('.zst')) return createReadStream(path);
  const proc = spawn('zstd', ['-dc', path], { stdio: ['ignore', 'pipe', 'inherit'] });
  proc.on('error', (e) => {
    console.error('No se pudo ejecutar zstd. Instálalo o descomprime el fichero a mano.', e.message);
    process.exit(1);
  });
  return proc.stdout;
}

/** Lee el CSV y llama a `onRow` con cada problema que pasa los filtros de calidad y es jugable. */
async function scan(onRow: (row: Puzzle) => void, inRange: (rating: number) => boolean) {
  const rl = createInterface({ input: openInput(input), crlfDelay: Infinity });
  let header: string[] | null = null;
  let col: Record<string, number> = {};
  let total = 0;
  for await (const line of rl) {
    if (!header) {
      header = line.split(',');
      col = Object.fromEntries(header.map((h, i) => [h, i]));
      continue;
    }
    total++;
    if (total % 1_000_000 === 0) console.log(`  ${total.toLocaleString('es')} filas leídas…`);
    const f = line.split(',');
    const rating = Number(f[col.Rating]);
    if (!inRange(rating)) continue;
    if (Number(f[col.Popularity]) < minPopularity) continue;
    if (Number(f[col.NbPlays]) < minPlays) continue;
    if (Number(f[col.RatingDeviation]) > maxRd) continue;
    const moves = f[col.Moves].split(' ');
    const fen = f[col.FEN];
    if (moves.length < 2 || !isPlayable(fen, moves)) continue;
    onRow({ id: f[col.PuzzleId], fen, opponentMove: moves[0], solution: moves.slice(1), rating, themes: f[col.Themes].split(' ') });
  }
  return total;
}

function readExisting(): Puzzle[] {
  return existsSync(output) ? puzzleFileSchema.parse(JSON.parse(readFileSync(output, 'utf8'))).puzzles : [];
}

function write(puzzles: Puzzle[]) {
  const file = puzzleFileSchema.parse({
    source: 'Lichess puzzle database (https://database.lichess.org/#puzzles), CC0',
    generated: new Date().toISOString().slice(0, 10),
    puzzles,
  });
  writeFileSync(output, JSON.stringify(file, null, 0).replace(/\},\{/g, '},\n{') + '\n');
}

/** Modo --add: conjuntos de nivel intermedio y avanzado del temario. */
async function addHigherLevels() {
  const existing = readExisting();
  const taken = new Set(existing.map((p) => p.id));
  const curriculum = curriculumSchema.parse(curriculumJson);
  const sets = curriculum.blocks
    .flatMap((b) => b.lessons)
    .flatMap((l) => (l.type === 'puzzles' && l.status === 'available' && l.level !== 'principiante' ? [l] : []))
    .map((l) => {
      const range = LEVEL_RATING[l.level];
      const have = existing.filter(
        (p) => p.rating >= range.min && p.rating <= range.max && p.themes.some((t) => (l.themes as string[]).includes(t)),
      ).length;
      const want = Math.max(0, perSet - have);
      const span = range.max === 9999 ? 2400 - range.min : range.max - range.min;
      return {
        id: l.id,
        themes: l.themes as string[],
        range,
        want,
        // Mismo reparto por tramos de dificultad que en principiante.
        bucket: (r: number) => Math.min(BUCKETS - 1, Math.floor(((r - range.min) / (span + 1)) * BUCKETS)),
        pools: Array.from({ length: BUCKETS }, () => [] as Candidate[]),
      };
    });
  const pending = sets.filter((s) => s.want > 0);
  for (const s of sets) console.log(`  ${s.id}: ${s.want ? `faltan ${s.want}` : 'completo'}`);
  if (!pending.length) return console.log('Nada que añadir.');

  const lowest = Math.min(...pending.map((s) => s.range.min));
  const total = await scan(
    (row) => {
      if (taken.has(row.id)) return;
      // Cada problema va a un solo conjunto: el primero del temario que lo acepte.
      const set = pending.find(
        (s) => row.rating >= s.range.min && row.rating <= s.range.max && row.themes.some((t) => s.themes.includes(t)),
      );
      if (!set) return;
      const pool = set.pools[set.bucket(row.rating)];
      const c = { rank: rank(row.id), row };
      const cap = Math.ceil(set.want / BUCKETS);
      if (pool.length < cap) return void pool.push(c);
      let worst = 0;
      for (let i = 1; i < pool.length; i++) if (pool[i].rank > pool[worst].rank) worst = i;
      if (c.rank < pool[worst].rank) pool[worst] = c;
    },
    (r) => r >= lowest,
  );

  const added: Puzzle[] = [];
  for (const s of pending) {
    const chosen = s.pools.flat().sort((a, b) => a.row.rating - b.row.rating).slice(0, s.want);
    console.log(`  ${s.id}: +${chosen.length}`);
    added.push(...chosen.map((c) => c.row));
  }
  write([...existing, ...added]);
  console.log(`Leídas ${total.toLocaleString('es')} filas. Añadidos ${added.length} problemas (total ${existing.length + added.length}) en ${output}.`);
}

async function main() {
  if (addMode) return addHigherLevels();
  const rl = createInterface({ input: openInput(input), crlfDelay: Infinity });
  let header: string[] | null = null;
  let col: Record<string, number> = {};
  let total = 0;
  let passed = 0;
  let illegal = 0;

  for await (const line of rl) {
    if (!header) {
      header = line.split(',');
      col = Object.fromEntries(header.map((h, i) => [h, i]));
      for (const needed of ['PuzzleId', 'FEN', 'Moves', 'Rating', 'RatingDeviation', 'Popularity', 'NbPlays', 'Themes']) {
        if (!(needed in col)) throw new Error(`Columna ${needed} no encontrada en la cabecera`);
      }
      continue;
    }
    total++;
    if (total % 1_000_000 === 0) console.log(`  ${total.toLocaleString('es')} filas leídas…`);
    const f = line.split(',');
    const rating = Number(f[col.Rating]);
    if (rating < minRating || rating > maxRating) continue;
    if (Number(f[col.Popularity]) < minPopularity) continue;
    if (Number(f[col.NbPlays]) < minPlays) continue;
    if (Number(f[col.RatingDeviation]) > maxRd) continue;
    const themes = f[col.Themes].split(' ');
    const theme = PRIORITY.find((t) => themes.includes(t));
    if (!theme) continue;
    passed++;

    const id = f[col.PuzzleId];
    const moves = f[col.Moves].split(' ');
    const fen = f[col.FEN];
    if (moves.length < 2 || !isPlayable(fen, moves)) {
      illegal++;
      continue;
    }
    offer(theme, bucketOf(rating), {
      rank: rank(id),
      row: { id, fen, opponentMove: moves[0], solution: moves.slice(1), rating, themes },
    });
  }

  const puzzles: Puzzle[] = [];
  for (const theme of BEGINNER_THEMES) {
    const chosen = pools.get(theme)!.flat().sort((a, b) => a.row.rating - b.row.rating);
    console.log(`  ${theme}: ${chosen.length}`);
    puzzles.push(...chosen.map((c) => c.row));
  }

  // Los de niveles superiores (modo --add) se conservan.
  const higher = readExisting().filter((p) => p.rating > maxRating);
  write([...puzzles, ...higher]);
  console.log(
    `Leídas ${total.toLocaleString('es')} filas; ${passed.toLocaleString('es')} pasan los filtros; ` +
      `${illegal} descartadas por jugadas ilegales. Guardados ${puzzles.length} problemas en ${output}.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
