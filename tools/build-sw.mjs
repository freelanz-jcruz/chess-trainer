// Genera out/sw.js tras `next build`:
// 1. compila sw/sw.ts con esbuild;
// 2. Serwist inyecta la lista de precache con todos los ficheros de out/ (con su hash de revisión).
import { build } from 'esbuild';
import { injectManifest } from '@serwist/build';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const out = join(root, 'out');
const tmp = join(root, '.next', 'sw.compiled.js');
const basePath = process.env.BASE_PATH ?? '';

await build({
  entryPoints: [join(root, 'sw', 'sw.ts')],
  outfile: tmp,
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2020',
  define: { 'process.env.BASE_PATH': JSON.stringify(basePath), 'process.env.NODE_ENV': '"production"' },
});

const { count, size, warnings } = await injectManifest({
  swSrc: tmp,
  swDest: join(out, 'sw.js'),
  globDirectory: out,
  globPatterns: ['**/*.{html,txt,js,css,json,webmanifest,wasm,png,svg,ico,woff2}'],
  globIgnores: ['sw.js'],
  // El .wasm de Stockfish pesa ~1,8 MB; el límite por defecto (2 MB) va justo.
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
  // Los ficheros de _next/static ya llevan hash en el nombre: no hace falta revisión.
  dontCacheBustURLsMatching: /^_next\/static\//,
  modifyURLPrefix: basePath ? { '': `${basePath}/` } : undefined,
});

rmSync(tmp, { force: true });
for (const w of warnings) console.warn(`⚠ ${w}`);
console.log(`Service worker generado: ${count} ficheros en precache (${(size / 1024 / 1024).toFixed(1)} MB)`);
