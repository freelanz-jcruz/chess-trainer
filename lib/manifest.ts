import type { MetadataRoute } from 'next';
import { withBase } from '@/lib/base-path';
import { getMessages, type Locale } from '@/lib/i18n';
import { routeHref } from '@/lib/i18n/routes';

/**
 * Manifiesto de la app instalable en un idioma (/manifest.webmanifest y /en/manifest.webmanifest): la app
 * instalada desde las páginas en inglés se abre en inglés. El ámbito es todo el sitio en los dos casos.
 */
export function manifestFor(locale: Locale): MetadataRoute.Manifest {
  const t = getMessages(locale);
  return {
    name: t.appName,
    short_name: t.appName,
    description: t.meta.description,
    lang: locale,
    id: withBase('/'),
    start_url: withBase(routeHref(locale, { name: 'home' })),
    scope: withBase('/'),
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#152747',
    theme_color: '#152747',
    icons: [
      { src: withBase('/icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: withBase('/icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: withBase('/icons/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
