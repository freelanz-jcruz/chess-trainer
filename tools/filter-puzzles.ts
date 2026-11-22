/**
 * Filtra la base de problemas de Lichess (CC0) y genera content/puzzles/puzzles.json.
 *
 * Uso:
 *   npm run puzzles -- --input tools/data/lichess_db_puzzle.csv.zst [--per-theme 100]
 *     [--min-rating 400] [--max-rating 1400] [--min-popularity 90] [--min-plays 500] [--max-rd 100]
 *
 * Requiere el comando `zstd` (brew install zstd / apt install zstd) si la entrada está comprimida.
 *
 * ¡Ojo! En el CSV, FEN es la posición ANTES de la primera jugada de Moves, y esa jugada es del rival.
 */
import { spawn } from 'node:child_process';
import { createReadStream, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';
import { Chess } from 'chess.js';
import { PUZZLE_THEMES, puzzleFileSchema, type Puzzle, type PuzzleTheme } from '../lib/content/schemas';

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
  PUZZLE_THEMES.map((t) => [t, Array.from({ length: BUCKETS }, () => [])]),
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

async function main() {
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
  for (const theme of PUZZLE_THEMES) {
    const chosen = pools.get(theme)!.flat().sort((a, b) => a.row.rating - b.row.rating);
    console.log(`  ${theme}: ${chosen.length}`);
    puzzles.push(...chosen.map((c) => c.row));
  }

  const file = puzzleFileSchema.parse({
    source: 'Lichess puzzle database (https://database.lichess.org/#puzzles), CC0',
    generated: new Date().toISOString().slice(0, 10),
    puzzles,
  });
  writeFileSync(output, JSON.stringify(file, null, 0).replace(/\},\{/g, '},\n{') + '\n');
  console.log(
    `Leídas ${total.toLocaleString('es')} filas; ${passed.toLocaleString('es')} pasan los filtros; ` +
      `${illegal} descartadas por jugadas ilegales. Guardados ${puzzles.length} problemas en ${output}.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
