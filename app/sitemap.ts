import type { MetadataRoute } from 'next';
import { lessons, openings, puzzleSets } from '@/lib/content/load';
import { LOCALES } from '@/lib/i18n';
import { routeHref, type Route } from '@/lib/i18n/routes';
import { absoluteUrl, languageAlternates } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * sitemap.xml con las páginas públicas en todos los idiomas, cada una con sus equivalentes (hreflang).
 * Se genera del contenido al compilar: las lecciones y aperturas nuevas entran solas.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [Route, number][] = [
    [{ name: 'info' }, 1],
    [{ name: 'home' }, 0.9],
    ...lessons.map((l): [Route, number] => [{ name: 'lesson', id: l.id }, 0.7]),
    ...openings.map((o): [Route, number] => [{ name: 'opening', id: o.id }, 0.7]),
    ...puzzleSets.map((s): [Route, number] => [{ name: 'puzzles', id: s.id }, 0.6]),
    [{ name: 'credits' }, 0.3],
  ];
  return LOCALES.flatMap((locale) =>
    pages.map(([route, priority]) => ({
      url: absoluteUrl(routeHref(locale, route)),
      priority,
      alternates: { languages: languageAlternates(route) },
    })),
  );
}
