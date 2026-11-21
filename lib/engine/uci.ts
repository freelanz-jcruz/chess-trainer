/** Puntuación UCI desde el punto de vista del bando que mueve. */
export type Score = { type: 'cp'; value: number } | { type: 'mate'; value: number };

export type InfoLine = {
  depth: number;
  multipv: number;
  score: Score;
  pv: string[];
};

/** Interpreta una línea "info ..." de Stockfish. Devuelve null si no trae puntuación. */
export function parseInfo(line: string): InfoLine | null {
  if (!line.startsWith('info ') || !line.includes(' score ')) return null;
  const tokens = line.split(/\s+/);
  let depth = 0;
  let multipv = 1;
  let score: Score | null = null;
  let pv: string[] = [];
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'depth') depth = Number(tokens[++i]);
    else if (t === 'multipv') multipv = Number(tokens[++i]);
    else if (t === 'score') {
      const kind = tokens[++i];
      const value = Number(tokens[++i]);
      if (kind === 'cp' || kind === 'mate') score = { type: kind, value };
      // "lowerbound"/"upperbound" pueden seguir; se ignoran.
    } else if (t === 'pv') {
      pv = tokens.slice(i + 1);
      break;
    }
  }
  if (!score) return null;
  return { depth, multipv, score, pv };
}

export function parseBestMove(line: string): string | null {
  const m = /^bestmove (\S+)/.exec(line);
  if (!m || m[1] === '(none)') return null;
  return m[1];
}
