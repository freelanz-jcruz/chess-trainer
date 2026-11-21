'use client';
import { Engine, type UciTransport } from './engine';

export const ENGINE_URL = '/engine/stockfish-19-lite-single.js';

let instance: Engine | null = null;

/** Motor compartido por toda la app (un único Web Worker, creado bajo demanda). */
export function getEngine(): Engine {
  if (instance) return instance;
  const worker = new Worker(ENGINE_URL);
  const transport: UciTransport = {
    send: (cmd) => worker.postMessage(cmd),
    onLine: (cb) => {
      worker.onmessage = (e: MessageEvent) => cb(String(e.data));
    },
    terminate: () => worker.terminate(),
  };
  instance = new Engine(transport);
  return instance;
}
