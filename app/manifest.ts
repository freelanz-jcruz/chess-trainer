import type { MetadataRoute } from 'next';
import { withBase } from '@/lib/base-path';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chess Trainer',
    short_name: 'Ajedrez',
    description: 'Aprende ajedrez desde cero: aperturas paso a paso y ejercicios valorados con Stockfish.',
    lang: 'es',
    start_url: withBase('/'),
    scope: withBase('/'),
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1d1b19',
    theme_color: '#2f6f4f',
    icons: [
      { src: withBase('/icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: withBase('/icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: withBase('/icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
