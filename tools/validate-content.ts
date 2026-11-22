/**
 * Validador de contenido: npm run validate [-- --depth 16] [--deep] [--no-cache]
 *
 * - Esquemas de todos los JSON de content/.
 * - Temario: referencias existentes, ids únicos, lecciones de ejercicios con problemas.
 * - Aperturas: todas las ramas, jugadas legales, notas breves y, con Stockfish, que ninguna jugada
 *   del bando del usuario sea un error (≥ 1 peón de pérdida); las imprecisiones son avisos y las
 *   jugadas dudosas del rival solo se informan. Trampas: en cada línea el rival comete un error y
 *   el usuario acaba con mate o con ventaja clara (TRAP_MIN_ADVANTAGE).
 * - Problemas: jugadas legales; con --deep, que la primera jugada de la solución sea la del motor.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { allLines, type LinePly } from '../lib/chess/opening-line';
import { Chess } from 'chess.js';
import { makeChess, movesFrom, playUci, sanToUci } from '../lib/chess/game';
import { shortestDrill } from '../lib/chess/drill';
import { sanToEs } from '../lib/chess/notation-es';
import {
  curriculumSchema,
  lessonFileSchema,
  type LessonFile,
  MAX_NOTE_LENGTH,
  openingSchema,
  puzzleFileSchema,
  type Opening,
  type OpeningStep,
} from '../lib/content/schemas';
import { lessons as registeredLessons, openings as registeredOpenings } from '../lib/content/load';
import type { Analysis, Engine } from '../lib/engine/engine';
import { assessMove, VERDICT_LABEL, type Verdict } from '../lib/engine/evaluate';

/**
 * Ventaja mínima (en peones) al final de una trampa. Algunas trampas clásicas (Fegatello) no ganan
 * material a la fuerza, sino que dejan al rey rival expuesto: Stockfish les da unos +0,8.
 */
const TRAP_MIN_ADVANTAGE = 0.7;
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
function validateCurriculum(openingIds: Set<string>, puzzleThemes: Set<string>, lessonIds: Set<string>) {
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
      if (l.type === 'lesson' && !lessonIds.has(l.ref)) error(`La lección ${l.id} apunta a un fichero de lección inexistente: ${l.ref}`);
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
  const myColor = op.side === 'white' ? 'w' : 'b';
  const verdicts = new Map<string, Verdict>(); // fenBefore+uci -> valoración
  for (const { path, line } of lines) {
    for (const ply of line) {
      const key = ply.fenBefore + ply.uci;
      if (verdicts.has(key)) continue; // ramas que comparten el principio
      const best = await analyze(ply.fenBefore);
      if (best.bestMove === ply.uci) {
        verdicts.set(key, 'good');
        continue;
      }
      const after = await analyze(ply.fenAfter);
      const { verdict, loss, reason } = assessMove(best.score, scoreForMover(after));
      verdicts.set(key, verdict);
      if (verdict === 'good') continue;
      const label = `${path}: ${Math.floor(ply.ply / 2) + 1}${ply.color === 'w' ? '.' : '...'}${sanToEs(ply.san)}`;
      const bestSan = best.bestMove ? playUci(ply.fenBefore, best.bestMove)?.san : undefined;
      const lossText = loss === null ? (reason === 'allowsMate' ? 'permite mate' : 'mate de por medio') : `−${loss.toFixed(2)}`;
      const detail = `${VERDICT_LABEL[verdict]} (${lossText}; Stockfish prefiere ${bestSan ? sanToEs(bestSan) : '?'})`;
      if (ply.color !== myColor) {
        // Las jugadas del rival pueden ser dudosas: es lo que juega la gente (y en las trampas, el cebo).
        console.log(`  · rival · ${label}: ${detail}`);
      } else if (verdict === 'mistake' || verdict === 'blunder') {
        error(`${label} es ${detail}`);
      } else {
        warn(`${label} es ${detail}`);
      }
    }
  }

  if (op.kind === 'trap') {
    // Cada línea de una trampa: el rival comete al menos un error y el usuario acaba claramente mejor.
    for (const { path, line } of lines) {
      const baited = line.some((p) => p.color !== myColor && ['inaccuracy', 'mistake', 'blunder'].includes(verdicts.get(p.fenBefore + p.uci)!));
      if (!baited) error(`${path}: el rival no comete ningún error, así que no es una trampa`);
      const last = line[line.length - 1];
      const final = playUci(last.fenBefore, last.uci);
      if (final?.isCheckmate) {
        if (last.color !== myColor) error(`${path}: la línea acaba con mate del rival`);
        else ok(`${path}: el rival cae en la trampa y recibe mate`);
        continue;
      }
      const a = await analyze(last.fenAfter);
      // La puntuación es para el bando que mueve en la posición final.
      const sign = (last.color === myColor ? -1 : 1);
      const forMe = a.score.type === 'mate' ? sign * Math.sign(a.score.value) * 100 : (sign * a.score.value) / 100;
      if (forMe < TRAP_MIN_ADVANTAGE)
        error(`${path}: al final de la trampa la ventaja es de ${forMe.toFixed(2)} (mínimo ${TRAP_MIN_ADVANTAGE})`);
      else ok(`${path}: el rival cae en la trampa y quedas ${a.score.type === 'mate' ? 'con mate' : `+${forMe.toFixed(2)}`}`);
    }
  }
  if (errors === errorsBefore) ok(`Stockfish (profundidad ${depth}) no considera error ninguna jugada de tu bando`);
}

// ---------- Lecciones por páginas ----------
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** FEN de partida real (con reyes y legal): lo exige el motor. */
function strictFen(fen: string): string | null {
  try {
    new Chess(fen);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

function looseFen(fen: string): string | null {
  try {
    makeChess(fen === 'startpos' ? START : fen);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

async function validateLesson(l: LessonFile) {
  console.log(`\nLección: ${l.title} (${l.id})`);
  const before = errors;
  for (const [i, page] of l.pages.entries()) {
    const where = `página ${i + 1} (${page.kind})`;
    if (!page.fen) {
      if (page.kind === 'text' || page.kind === 'quiz') {
        if (page.kind === 'quiz' && page.answer >= page.options.length) error(`${where}: la respuesta ${page.answer} no existe`);
        continue;
      }
    }
    const fen = page.fen === 'startpos' ? START : page.fen!;
    const bad = looseFen(fen);
    if (bad) {
      error(`${where}: FEN no válido (${bad})`);
      continue;
    }

    if (page.kind === 'text' || page.kind === 'quiz') {
      if (page.kind === 'quiz' && page.answer >= page.options.length) error(`${where}: la respuesta ${page.answer} no existe`);
      if (page.showMovesFrom && movesFrom(fen, page.showMovesFrom).length === 0)
        error(`${where}: no hay ninguna pieza con jugadas en ${page.showMovesFrom}`);
      continue;
    }

    if (page.kind === 'drill') {
      if (/[kK]/.test(fen.split(' ')[0])) error(`${where}: los ejercicios de movimiento no llevan reyes`);
      const path = shortestDrill(page, fen);
      if (!path) error(`${where}: el objetivo es inalcanzable`);
      else if (page.par && page.par < path.length) error(`${where}: par ${page.par} imposible; el mínimo es ${path.length}`);
      else if (page.par && page.par > path.length) warn(`${where}: par ${page.par}, pero se puede en ${path.length}`);
      else ok(`${where}: mínimo ${path.length} jugada(s)${page.par ? ' = par' : ''}`);
      continue;
    }

    // move y play: posición de partida real
    const needsStrict = page.kind === 'play' || page.goal !== 'listed';
    if (needsStrict) {
      const why = strictFen(fen);
      if (why) {
        error(`${where}: necesita una posición legal con reyes (${why})`);
        continue;
      }
    }
    let pos = fen;
    if (page.opponentMove) {
      const m = playUci(fen, page.opponentMove);
      if (!m) {
        error(`${where}: la jugada previa del rival ${page.opponentMove} es ilegal`);
        continue;
      }
      pos = m.fenAfter;
    }

    if (page.kind === 'move') {
      if (page.goal === 'listed') {
        if (!page.accept?.length) error(`${where}: falta la lista de jugadas aceptadas`);
        for (const san of page.accept ?? []) if (!sanToUci(pos, san)) error(`${where}: la jugada aceptada ${san} es ilegal`);
      } else if (page.goal === 'mate') {
        const mates = makeChess(pos)
          .moves({ verbose: true })
          .filter((m) => playUci(pos, m.from + m.to + (m.promotion ?? ''))?.isCheckmate);
        if (!mates.length) error(`${where}: no hay ningún mate en una jugada`);
      } else {
        const a = await analyze(pos);
        if (!a.bestMove) error(`${where}: la posición no tiene jugadas`);
      }
      continue;
    }

    // play
    const a = await analyze(pos);
    if (page.goal === 'checkmate') {
      const mateIn = a.score.type === 'mate' && a.score.value > 0 ? a.score.value : null;
      if (page.strict) {
        if (!page.maxMoves) error(`${where}: un mate en N necesita maxMoves`);
        else if (!mateIn || mateIn > page.maxMoves) error(`${where}: Stockfish no ve mate en ${page.maxMoves} (${JSON.stringify(a.score)})`);
        else ok(`${where}: mate en ${mateIn}`);
      } else if (!mateIn && !(a.score.type === 'cp' && a.score.value > 300)) {
        error(`${where}: la posición no parece ganadora (${JSON.stringify(a.score)})`);
      } else if (mateIn && page.maxMoves && mateIn > page.maxMoves) {
        error(`${where}: el mate más rápido es en ${mateIn}, más que maxMoves (${page.maxMoves})`);
      }
    }
  }
  if (errors === before) ok(`${l.pages.length} páginas correctas`);
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

  // Lecciones: esquema y registro en content/lessons/index.ts.
  const ldir = join(CONTENT, 'lessons');
  const lessonIds = new Set<string>();
  const validLessons: LessonFile[] = [];
  console.log('\nFicheros de lecciones');
  const lfiles = readdirSync(ldir).filter((f) => f.endsWith('.json'));
  for (const f of lfiles) {
    const parsed = lessonFileSchema.safeParse(readJson(join(ldir, f)));
    if (!parsed.success) {
      error(`${f}: ${parsed.error.message}`);
      continue;
    }
    if (`${parsed.data.id}.json` !== f) error(`${f}: el id (${parsed.data.id}) no coincide con el nombre del fichero`);
    if (!registeredLessons.some((l) => l.id === parsed.data.id)) error(`${f}: no está registrada en content/lessons/index.ts`);
    lessonIds.add(parsed.data.id);
    validLessons.push(parsed.data);
  }
  ok(`${lfiles.length} fichero(s)`);

  const themes = await validatePuzzles();
  validateCurriculum(openingIds, themes, lessonIds);
  for (const op of valid) await validateOpening(op);
  for (const l of validLessons) await validateLesson(l);

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
