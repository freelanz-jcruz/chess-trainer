/// <reference lib="webworker" />
// Service worker de la PWA. Se compila con esbuild y Serwist le inyecta la lista de precache
// (todo out/: páginas, JS, CSS, el motor Stockfish y los datos) en tools/build-sw.mjs.
import { NetworkFirst, Serwist, type PrecacheEntry } from 'serwist';

declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST: (PrecacheEntry | string)[] };

const BASE = process.env.BASE_PATH ?? '';

/**
 * Idioma con el que se registró (/sw.js?lang=en, ver components/ServiceWorker.tsx). Solo se precachean las
 * páginas de ese idioma y todo lo común (JS, CSS, motor, iconos): así nadie descarga dos veces la app.
 * Las páginas del otro idioma se guardan al visitarlas (caché «pages», más abajo).
 */
const LANG = new URL(self.location.href).searchParams.get('lang') ?? 'es';
const OTHER_LOCALE_PREFIX = '/en/'; // páginas que no son en español (de momento, solo inglés)

function keep(entry: PrecacheEntry | string): boolean {
  // Las URLs del precache son relativas a out/ («en/lessons/…/index.html») o llevan BASE_PATH delante.
  const url = typeof entry === 'string' ? entry : entry.url;
  const path = `/${(BASE && url.startsWith(`${BASE}/`) ? url.slice(BASE.length) : url).replace(/^\//, '')}`;
  if (!/\.(html|txt)$/.test(path) || path === '/404.html' || path === '/robots.txt') return true;
  const english = path.startsWith(OTHER_LOCALE_PREFIX);
  return LANG === 'en' ? english : !english;
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST.filter(keep),
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
  // Páginas que no están en el precache (las del otro idioma, o una URL inexistente): se intenta la red y
  // se guarda una copia para usarla sin conexión; si no hay red ni copia, se muestra la 404 precacheada.
  // Incluye los .txt de RSC que pide la navegación de Next entre páginas.
  runtimeCaching: [
    {
      matcher: ({ request, url }) =>
        url.origin === self.location.origin && (request.mode === 'navigate' || url.searchParams.has('_rsc') || url.pathname.endsWith('.txt')),
      handler: new NetworkFirst({ cacheName: 'pages' }),
    },
  ],
  fallbacks: {
    entries: [{ url: `${BASE}/404.html`, matcher: ({ request }) => request.destination === 'document' }],
  },
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

serwist.addEventListeners();
