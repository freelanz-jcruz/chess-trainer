// Copia el motor Stockfish (WASM, un solo hilo, red "lite") a public/engine.
// Se ejecuta en postinstall; los ficheros copiados no se versionan.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(dirname(require.resolve('stockfish/package.json')), 'bin');
const destDir = join(root, 'public', 'engine');
const files = ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm'];

mkdirSync(destDir, { recursive: true });
for (const f of files) {
  const src = join(srcDir, f);
  if (!existsSync(src)) {
    console.error(`No se encuentra ${src}`);
    process.exit(1);
  }
  copyFileSync(src, join(destDir, f));
}
console.log(`Stockfish copiado a ${destDir}`);
