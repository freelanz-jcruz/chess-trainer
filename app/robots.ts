import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { BASE_PATH } from '@/lib/base-path';
import { LOCALES } from '@/lib/i18n';
import { routeHref } from '@/lib/i18n/routes';

export const dynamic = 'force-static';

/**
 * robots.txt. Todo se puede indexar salvo:
 * - Progreso y Repaso: dependen del progreso guardado en cada dispositivo; vacías para un buscador.
 * - Los .txt de navegación de Next (RSC): solo los pide la app al cambiar de página.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        ...LOCALES.flatMap((l) => [routeHref(l, { name: 'progress' }), routeHref(l, { name: 'review' })]).map((p) => `${BASE_PATH}${p}`),
        '/*.txt$',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
