import type { MetadataRoute } from 'next';
import { withBase } from '@/lib/base-path';
import { DEFAULT_LOCALE, getMessages } from '@/lib/i18n';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  const t = getMessages(DEFAULT_LOCALE);
  return {
    name: t.appName,
    short_name: t.appName,
    description: t.meta.description,
    lang: DEFAULT_LOCALE,
    start_url: withBase('/'),
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
