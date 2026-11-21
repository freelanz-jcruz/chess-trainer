import { Chess } from 'chess.js';
import { parseBestMove, parseInfo, type Score } from './uci';

/** Canal de comunicación UCI: un Web Worker en el navegador o el módulo de Node en los scripts. */
export interface UciTransport {
  send(cmd: string): void;
  onLine(cb: (line: string) => void): void;
  terminate(): void;
}

export type Analysis = {
  /** Mejor jugada en UCI, o null si la partida ha terminado. */
  bestMove: string | null;
  /** Puntuación desde el punto de vista del bando que mueve en `fen`. */
  score: Score;
  pv: string[];
  depth: number;
};

export type AnalyzeOptions = { movetime?: number; depth?: number };

type Job = {
  fen: string;
  opts: AnalyzeOptions;
  resolve: (a: Analysis) => void;
  reject: (e: Error) => void;
  cancelled: boolean;
};

/**
 * Envoltorio mínimo de Stockfish: cola de análisis de una posición cada vez.
 * Las posiciones terminadas (mate o ahogado) se resuelven sin preguntar al motor.
 */
export class Engine {
  private ready: Promise<void>;
  private queue: Job[] = [];
  private current: Job | null = null;
  private last: { score: Score; pv: string[]; depth: number } | null = null;
  private listeners: ((line: string) => void)[] = [];

  constructor(private transport: UciTransport) {
    transport.onLine((raw) => {
      for (const line of String(raw).split('\n')) {
        if (line) this.handle(line.trim());
      }
    });
    this.ready = new Promise((resolve) => {
      const onReady = (line: string) => {
        if (line === 'readyok') {
          this.listeners = this.listeners.filter((l) => l !== onReady);
          resolve();
        }
      };
      this.listeners.push(onReady);
      transport.send('uci');
      transport.send('setoption name MultiPV value 1');
      transport.send('isready');
    });
  }

  private handle(line: string) {
    for (const l of this.listeners) l(line);
    const job = this.current;
    if (!job) return;
    const info = parseInfo(line);
    if (info && info.multipv === 1 && info.pv.length > 0) {
      this.last = { score: info.score, pv: info.pv, depth: info.depth };
      return;
    }
    if (line.startsWith('bestmove')) {
      const best = parseBestMove(line);
      const last = this.last;
      this.current = null;
      this.last = null;
      if (!job.cancelled) {
        if (last) job.resolve({ bestMove: best ?? last.pv[0] ?? null, ...last });
        else job.reject(new Error('El motor no devolvió evaluación'));
      }
      this.next();
    }
  }

  private next() {
    if (this.current) return;
    const job = this.queue.shift();
    if (!job) return;
    this.current = job;
    this.last = null;
    this.transport.send(`position fen ${job.fen}`);
    const parts = ['go'];
    if (job.opts.depth) parts.push(`depth ${job.opts.depth}`);
    if (job.opts.movetime) parts.push(`movetime ${job.opts.movetime}`);
    if (parts.length === 1) parts.push('depth 12');
    this.transport.send(parts.join(' '));
  }

  /** Analiza una posición. Si `fen` es mate o ahogado, responde al instante. */
  async analyze(fen: string, opts: AnalyzeOptions = {}): Promise<Analysis> {
    const terminal = terminalScore(fen);
    if (terminal) return { bestMove: null, score: terminal, pv: [], depth: 0 };
    await this.ready;
    return new Promise<Analysis>((resolve, reject) => {
      this.queue.push({ fen, opts, resolve, reject, cancelled: false });
      this.next();
    });
  }

  /** Descarta los análisis pendientes y detiene el actual (sus promesas no se resuelven). */
  cancelAll() {
    for (const job of this.queue) job.cancelled = true;
    this.queue = [];
    if (this.current) {
      this.current.cancelled = true;
      this.transport.send('stop');
    }
  }

  terminate() {
    this.cancelAll();
    this.transport.terminate();
  }
}

/** Puntuación de una posición terminada, desde el punto de vista del bando que mueve. */
export function terminalScore(fen: string): Score | null {
  const chess = new Chess(fen);
  if (chess.isCheckmate()) return { type: 'mate', value: 0 };
  if (chess.isStalemate() || chess.isInsufficientMaterial()) return { type: 'cp', value: 0 };
  return null;
}
