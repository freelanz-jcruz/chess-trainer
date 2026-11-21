/**
 * Validador de contenido: npm run validate [-- --depth 16] [--deep] [--no-cache]
 *
 * - Esquemas de todos los JSON de content/.
 * - Temario: referencias existentes, ids únicos, lecciones de ejercicios con problemas.
 * - Aperturas: todas las ramas, jugadas legales, notas breves y, con Stockfish, que ninguna jugada
 *   del libro sea un error (≥ 1 peón de pérdida). Las imprecisiones son avisos.
 * - Problemas: jugadas legales; con --deep, que la primera jugada de la solución sea la del motor.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allLines, type LinePly } from '../lib/chess/opening-line';
import { playUci } from '../lib/chess/game';
import { sanToEs } from '../lib/chess/notation-es';
import {
  curriculumSchema,
  MAX_NOTE_LENGTH,
  openingSchema,
  puzzleFileSchema,
  type Opening,
  type OpeningStep,
} from '../lib/content/schemas';
import { openings as registeredOpenings } from '../lib/content/load';
import type { Analysis, Engine } from '../lib/engine/engine';
import { assessMove, VERDICT_LABEL } from '../lib/engine/evaluate';
import { scoreForMover } from '../lib/engine/evaluate-move';
import { createNodeEngine } from '../lib/engine/node';

const ROOT = join(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'content');
const CACHE_FILE = join(ROOT, 'tools', '.cache', 'evals.json');

const argv = process.argv.slice(2);
const depth = Number(argv[argv.indexOf('--depth') + 1]) || 16;
const deep = argv.includes('--deep');
const useCache = !argv.includes('--no-cache');

let errors = 0;
let warnings = 0;
const error = (msg: string) => {
  errors++;
  console.log(`  ✗ ${msg}`);
};
const warn = (msg: string) => {
  warnings++;
  console.log(`  ⚠ ${msg}`);
};
const ok = (msg: string) => console.log(`  ✓ ${msg}`);

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));

// ---------- Caché de evaluaciones ----------
const cache: Record<string, Analysis> = useCache && existsSync(CACHE_FILE) ? (readJson(CACHE_FILE) as Record<string, Analysis>) : {};
let engine: Engine | null = null;
async function analyze(fen: string): Promise<Analysis> {
  const key = `${depth}|${fen}`;
  if (cache[key]) return cache[key];
  engine ??= createNodeEngine();
  const a = await engine.analyze(fen, { depth });
  cache[key] = a;
  return a;
}

// ---------- Temario ----------
function validateCurriculum(openingIds: Set<string>, puzzleThemes: Set<string>) {
  console.log('\nTemario');
  const parsed = curriculumSchema.safeParse(readJson(join(CONTENT, 'curriculum.json')));
  if (!parsed.success) {
    error(`curriculum.json no cumple el esquema: ${parsed.error.message}`);
    return;
  }
  const seen = new Set<string>();
  for (const block of parsed.data.blocks) {
    for (const l of block.lessons) {
      if (seen.has(l.id)) error(`Id de lección repetido: ${l.id}`);
      seen.add(l.id);
      if (l.status !== 'available') continue;
      if (l.type === 'opening' && !openingIds.has(l.ref)) error(`La lección ${l.id} apunta a una apertura inexistente: ${l.ref}`);
      if (l.type === 'puzzles' && !l.themes.some((t) => puzzleThemes.has(t)))
        error(`La lección ${l.id} no tiene ningún problema de los temas ${l.themes.join(', ')}`);
    }
  }
  ok(`${parsed.data.blocks.length} bloques, ${seen.size} lecciones`);
}

// ---------- Aperturas ----------
function checkStructure(steps: OpeningStep[], where: string, isBranch: boolean) {
  steps.forEach((s, i) => {
    if (s.note && s.note.length > MAX_NOTE_LENGTH)
      error(`${where}: la nota de ${s.san} tiene ${s.note.length} caracteres (máx. ${MAX_NOTE_LENGTH})`);
    if (isBranch && i === 0 && s.branches?.length)
      error(`${where}: el primer paso de una rama no puede tener ramas (decláralas como ramas hermanas)`);
    for (const b of s.branches ?? []) checkStructure(b.steps, `${where} > ${b.name}`, true);
  });
}

async function validateOpening(op: Opening) {
  console.log(`\nApertura: ${op.name} (${op.id})`);
  checkStructure(op.steps, op.id, false);
  let lines: { path: string; line: LinePly[] }[];
  try {
    lines = allLines(op);
  } catch (e) {
    error((e as Error).message);
    return;
  }
  ok(`${lines.length} línea(s), todas las jugadas son legales`);

  const errorsBefore = errors;
  const checked = new Set<string>();
  for (const { path, line } of lines) {
    for (const ply of line) {
      const key = ply.fenBefore + ply.uci;
      if (checked.has(key)) continue; // ramas que comparten el principio
      checked.add(key);
      const best = await analyze(ply.fenBefore);
      if (best.bestMove === ply.uci) continue;
      const after = await analyze(ply.fenAfter);
      const { verdict, loss, reason } = assessMove(best.score, scoreForMover(after));
      const label = `${path}: ${Math.floor(ply.ply / 2) + 1}${ply.color === 'w' ? '.' : '...'}${sanToEs(ply.san)}`;
      const bestSan = best.bestMove ? playUci(ply.fenBefore, best.bestMove)?.san : undefined;
      const lossText = loss === null ? (reason === 'allowsMate' ? 'permite mate' : 'mate de por medio') : `−${loss.toFixed(2)}`;
      const detail = `${VERDICT_LABEL[verdict]} (${lossText}; Stockfish prefiere ${bestSan ? sanToEs(bestSan) : '?'})`;
      if (op.kind === 'trap') {
        console.log(`  · ${label}: ${detail}`);
      } else if (verdict === 'mistake' || verdict === 'blunder') {
        error(`${label} es ${detail}`);
      } else if (verdict === 'inaccuracy') {
        warn(`${label} es ${detail}`);
      }
    }
  }
  if (op.kind === 'trap') warn('Validación específica de trampas pendiente (fase 4): solo se informa de las valoraciones');
  else if (errors === errorsBefore) ok(`Stockfish (profundidad ${depth}) no considera error ninguna jugada del libro`);
}

// ---------- Problemas ----------
async function validatePuzzles(): Promise<Set<string>> {
  console.log('\nProblemas');
  const themes = new Set<string>();
  const parsed = puzzleFileSchema.safeParse(readJson(join(CONTENT, 'puzzles', 'puzzles.json')));
  if (!parsed.success) {
    error(`puzzles.json no cumple el esquema: ${parsed.error.message}`);
    return themes;
  }
  const ids = new Set<string>();
  let deepChecked = 0;
  for (const p of parsed.data.puzzles) {
    if (ids.has(p.id)) error(`Problema repetido: ${p.id}`);
    ids.add(p.id);
    p.themes.forEach((t) => themes.add(t));
    let fen = p.fen;
    for (const m of [p.opponentMove, ...p.solution]) {
      const r = playUci(fen, m);
      if (!r) {
        error(`Problema ${p.id}: jugada ilegal ${m}`);
        break;
      }
      fen = r.fenAfter;
    }
    if (deep) {
      const start = playUci(p.fen, p.opponentMove)!.fenAfter;
      const a = await analyze(start);
      const first = playUci(start, p.solution[0])!;
      if (a.bestMove !== p.solution[0] && !first.isCheckmate) warn(`Problema ${p.id}: Stockfish prefiere ${a.bestMove} a ${p.solution[0]}`);
      deepChecked++;
    }
  }
  ok(`${parsed.data.puzzles.length} problemas con jugadas legales${deep ? `; ${deepChecked} comprobados con Stockfish` : ''}`);
  return themes;
}

async function main() {
  console.log(`Validando contenido (Stockfish lite, profundidad ${depth})`);

  // Aperturas: todos los ficheros deben cumplir el esquema y estar registrados en lib/content/load.ts.
  const dir = join(CONTENT, 'openings');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  const openingIds = new Set<string>();
  const valid: Opening[] = [];
  console.log('\nFicheros de aperturas');
  for (const f of files) {
    const parsed = openingSchema.safeParse(readJson(join(dir, f)));
    if (!parsed.success) {
      error(`${f}: ${parsed.error.message}`);
      continue;
    }
    if (`${parsed.data.id}.json` !== f) error(`${f}: el id (${parsed.data.id}) no coincide con el nombre del fichero`);
    if (!registeredOpenings.some((o) => o.id === parsed.data.id)) error(`${f}: no está registrada en lib/content/load.ts`);
    openingIds.add(parsed.data.id);
    valid.push(parsed.data);
  }
  ok(`${files.length} fichero(s)`);

  const themes = await validatePuzzles();
  validateCurriculum(openingIds, themes);
  for (const op of valid) await validateOpening(op);

  engine?.terminate();
  if (useCache) {
    mkdirSync(join(ROOT, 'tools', '.cache'), { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(cache));
  }
  console.log(`\n${errors} error(es), ${warnings} aviso(s).`);
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
