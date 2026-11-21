import { createRequire } from 'node:module';
import { Engine, type UciTransport } from './engine';

/** Motor para scripts de Node (validador). Usa el mismo Stockfish lite de un hilo. */
export function createNodeEngine(): Engine {
  const require = createRequire(import.meta.url);
  const init = require('stockfish') as (
    flavor: string,
    cb: (line: string) => void,
  ) => { processCommand(cmd: string): void; terminate(): void };
  let listener: (line: string) => void = () => {};
  const sf = init('lite-single', (line) => listener(line));
  const transport: UciTransport = {
    send: (cmd) => sf.processCommand(cmd),
    onLine: (cb) => {
      listener = cb;
    },
    terminate: () => sf.terminate(),
  };
  return new Engine(transport);
}
