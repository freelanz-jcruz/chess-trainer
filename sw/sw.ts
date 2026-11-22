/// <reference lib="webworker" />
// Service worker de la PWA. Se compila con esbuild y Serwist le inyecta la lista de precache
// (todo out/: páginas, JS, CSS, el motor Stockfish y los datos) en tools/build-sw.mjs.
import { NetworkOnly, Serwist, type PrecacheEntry } from 'serwist';

declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST: (PrecacheEntry | string)[] };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    // Las navegaciones de Next piden los .txt de RSC con ?_rsc=…; se sirven desde el precache igualmente.
    ignoreURLParametersMatching: [/^utm_/, /^_rsc$/],
    directoryIndex: 'index.html',
  },
  // La nueva versión espera a que el usuario pulse «Actualizar» (ver components/ServiceWorker.tsx).
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: false,
  // Navegaciones que no están en el precache (URL inexistente sin conexión): se intenta la red y,
  // si falla, se muestra la página 404 precacheada en lugar del error del navegador.
  runtimeCaching: [{ matcher: ({ request }) => request.mode === 'navigate', handler: new NetworkOnly() }],
  fallbacks: {
    entries: [{ url: `${process.env.BASE_PATH ?? ''}/404.html`, matcher: ({ request }) => request.destination === 'document' }],
  },
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

serwist.addEventListeners();
