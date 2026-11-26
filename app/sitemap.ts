import type { MetadataRoute } from 'next';
import { lessons, openings, puzzleSets } from '@/lib/content/load';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-static';

/** sitemap.xml con las páginas públicas; se genera del contenido al compilar (lecciones y aperturas nuevas entran solas). */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: absoluteUrl(path), priority });
  return [
    page('/info/', 1),
    page('/', 0.9),
    ...lessons.map((l) => page(`/lecciones/${l.id}/`, 0.7)),
    ...openings.map((o) => page(`/aperturas/${o.id}/`, 0.7)),
    ...puzzleSets.map((s) => page(`/ejercicios/${s.id}/`, 0.6)),
    page('/creditos/', 0.3),
  ];
}
