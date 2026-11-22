/**
 * Comprueba nombres y códigos ECO de las aperturas contra el catálogo de Lichess
 * (github.com/lichess-org/chess-openings, CC0): npm run eco
 *
 * Descarga los TSV en tools/data/chess-openings/ la primera vez (no se versionan).
 * Para cada línea del árbol busca la posición más profunda que aparece en el catálogo
 * (por posición, así se reconocen las transposiciones) y la compara con el ECO declarado:
 * el de la apertura para la línea principal y el de cada rama para sus líneas.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Chess } from 'chess.js';
import { allLines, buildLine, type LinePly } from '../lib/chess/opening-line';
import type { Opening, OpeningBranch } from '../lib/content/schemas';
import { openings } from '../lib/content/load';

const DIR = join(import.meta.dirname, 'data', 'chess-openings');
const BASE = 'https://raw.githubusercontent.com/lichess-org/chess-openings/master';

type Entry = { eco: string; name: string; plies: number };

async function loadCatalog(): Promise<Map<string, Entry>> {
  mkdirSync(DIR, { recursive: true });
  const byPos = new Map<string, Entry>();
  for (const letter of ['a', 'b', 'c', 'd', 'e']) {
    const file = join(DIR, `${letter}.tsv`);
    if (!existsSync(file)) {
      console.log(`Descargando ${letter}.tsv…`);
      const res = await fetch(`${BASE}/${letter}.tsv`);
      if (!res.ok) throw new Error(`No se pudo descargar ${letter}.tsv (${res.status})`);
      writeFileSync(file, await res.text());
    }
    for (const row of readFileSync(file, 'utf8').split('\n').slice(1)) {
      const [eco, name, pgn] = row.split('\t');
      if (!pgn) continue;
      const chess = new Chess();
      const sans = pgn.replace(/\d+\.(\.\.)?/g, ' ').trim().split(/\s+/);
      for (const san of sans) chess.move(san);
      const key = epd(chess.fen());
      const prev = byPos.get(key);
      // Ante varias entradas de la misma posición, la de menos jugadas es el nombre canónico.
      if (!prev || sans.length < prev.plies) byPos.set(key, { eco, name, plies: sans.length });
    }
  }
  return byPos;
}

const epd = (fen: string) => fen.split(' ').slice(0, 4).join(' ');

function deepest(line: LinePly[], catalog: Map<string, Entry>, upTo = line.length): { entry: Entry; ply: number } | null {
  let found: { entry: Entry; ply: number } | null = null;
  for (const p of line.slice(0, upTo)) {
    const e = catalog.get(epd(p.fenAfter));
    if (e) found = { entry: e, ply: p.ply };
  }
  return found;
}

/** Todas las ramas del árbol con el camino de ramas que lleva hasta ellas. */
function branchesOf(op: Opening): { branch: OpeningBranch; path: OpeningBranch[] }[] {
  const out: { branch: OpeningBranch; path: OpeningBranch[] }[] = [];
  const walk = (steps: Opening['steps'], path: OpeningBranch[]) => {
    for (const s of steps)
      for (const b of s.branches ?? []) {
        out.push({ branch: b, path: [...path, b] });
        walk(b.steps, [...path, b]);
      }
  };
  walk(op.steps, []);
  return out;
}

/** Línea que sigue exactamente un camino de ramas (y la principal en el resto). */
function lineFor(op: Opening, path: OpeningBranch[]): LinePly[] {
  return buildLine(op, (_ply, step) => step.branches?.find((b) => path.includes(b)) ?? null);
}

async function main() {
  const catalog = await loadCatalog();
  console.log(`Catálogo: ${catalog.size} posiciones con nombre\n`);
  let mismatches = 0;
  const check = (label: string, declared: string | undefined, line: LinePly[]) => {
    const d = deepest(line, catalog);
    if (!d) {
      console.log(`  ? ${label}: ninguna posición en el catálogo`);
      return;
    }
    const at = `${Math.floor(d.ply / 2) + 1}${d.ply % 2 === 0 ? '.' : '...'}`;
    const text = `${d.entry.eco} ${d.entry.name} (hasta ${at}${line[d.ply].san})`;
    if (!declared) console.log(`  · ${label}: ${text}`);
    else if (declared === d.entry.eco) console.log(`  ✓ ${label}: ${text}`);
    else {
      mismatches++;
      console.log(`  ✗ ${label}: declarado ${declared}, el catálogo dice ${text}`);
    }
  };

  for (const op of openings) {
    console.log(`${op.name} (${op.id})`);
    check('Línea principal', op.eco, buildLine(op));
    for (const { branch, path } of branchesOf(op)) check(path.map((b) => b.name).join(' > '), branch.eco, lineFor(op, path));
    console.log(`  ${allLines(op).length} línea(s)\n`);
  }
  console.log(mismatches ? `${mismatches} código(s) ECO no coinciden.` : 'Todos los ECO declarados coinciden.');
  process.exit(mismatches ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
