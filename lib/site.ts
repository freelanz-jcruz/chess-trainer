import type { Metadata } from 'next';
import { BASE_PATH } from './base-path';

/**
 * Dirección pública de la app, para lo que necesita URLs absolutas: sitemap.xml, robots.txt, la URL
 * canónica y los datos estructurados. Para publicar en otro dominio, define SITE_URL al compilar.
 */
export const SITE_ORIGIN = (process.env.SITE_URL ?? 'https://ajedreztutor.com').replace(/\/$/, '');

/** URL absoluta de una ruta de la app (con BASE_PATH si lo hay). */
export const absoluteUrl = (path: string) => `${SITE_ORIGIN}${BASE_PATH}${path}`;

/**
 * Open Graph común (vista previa al compartir el enlace). Una página que defina su propio `openGraph`
 * sustituye entero el del layout, así que debe partir de este.
 */
export const OPEN_GRAPH_BASE: NonNullable<Metadata['openGraph']> & { type: 'website' } = {
  type: 'website',
  siteName: 'Ajedrez Tutor',
  locale: 'es_ES',
  images: [{ url: `${BASE_PATH}/icons/icon-512.png`, width: 512, height: 512, alt: 'Ajedrez Tutor' }],
};
