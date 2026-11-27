import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

/**
 * Direcciones de la app en cada idioma. El español va en la raíz y los demás con su prefijo (/en/…); los
 * nombres de las secciones se traducen, pero los ids de lecciones, aperturas y temas son los mismos en
 * todos los idiomas (son también las claves del progreso guardado). Todos los enlaces internos salen de
 * aquí: así cambiar de idioma lleva a la misma página en el otro.
 */
export type Route =
  | { name: 'home' }
  | { name: 'lesson'; id: string }
  | { name: 'opening'; id: string }
  | { name: 'practice'; id: string }
  | { name: 'puzzles'; id: string }
  | { name: 'review' }
  | { name: 'progress' }
  | { name: 'info' }
  | { name: 'credits' };

type Segments = Record<'lessons' | 'openings' | 'practice' | 'puzzles' | 'review' | 'progress' | 'info' | 'credits', string>;

const SEGMENTS: Record<Locale, Segments> = {
  es: {
    lessons: 'lecciones',
    openings: 'aperturas',
    practice: 'practica',
    puzzles: 'ejercicios',
    review: 'repaso',
    progress: 'progreso',
    info: 'info',
    credits: 'creditos',
  },
  en: {
    lessons: 'lessons',
    openings: 'openings',
    practice: 'practice',
    puzzles: 'puzzles',
    review: 'review',
    progress: 'progress',
    info: 'about',
    credits: 'credits',
  },
};

/** Prefijo de cada idioma ('' para el español, que va en la raíz). */
export const localePrefix = (locale: Locale) => (locale === DEFAULT_LOCALE ? '' : `/${locale}`);

/** Dirección de una página en un idioma, con barra final (como la exportación estática). */
export function routeHref(locale: Locale, route: Route): string {
  const s = SEGMENTS[locale];
  const p = localePrefix(locale);
  switch (route.name) {
    case 'home':
      return `${p}/`;
    case 'lesson':
      return `${p}/${s.lessons}/${route.id}/`;
    case 'opening':
      return `${p}/${s.openings}/${route.id}/`;
    case 'practice':
      return `${p}/${s.openings}/${route.id}/${s.practice}/`;
    case 'puzzles':
      return `${p}/${s.puzzles}/${route.id}/`;
    case 'review':
    case 'progress':
    case 'info':
    case 'credits':
      return `${p}/${s[route.name]}/`;
  }
}

/** Idioma y página de una dirección (sin basePath), o null si no es una página conocida. */
export function parseRoute(path: string): { locale: Locale; route: Route } | null {
  const parts = path.split('/').filter(Boolean);
  const locale = LOCALES.find((l) => l !== DEFAULT_LOCALE && parts[0] === l) ?? DEFAULT_LOCALE;
  if (locale !== DEFAULT_LOCALE) parts.shift();
  const s = SEGMENTS[locale];
  const [a, b, c] = parts;
  let route: Route | null = null;
  if (!a) route = { name: 'home' };
  else if (a === s.lessons && b && !c) route = { name: 'lesson', id: b };
  else if (a === s.openings && b && !c) route = { name: 'opening', id: b };
  else if (a === s.openings && b && c === s.practice) route = { name: 'practice', id: b };
  else if (a === s.puzzles && b && !c) route = { name: 'puzzles', id: b };
  else if (!b) {
    const name = (['review', 'progress', 'info', 'credits'] as const).find((n) => s[n] === a);
    if (name) route = { name };
  }
  return route && { locale, route };
}

/** Sección de la barra de navegación a la que pertenece una página. */
export function navSection(route: Route): 'home' | 'review' | 'puzzles' | 'progress' | null {
  if (route.name === 'home' || route.name === 'lesson' || route.name === 'opening' || route.name === 'practice') return 'home';
  if (route.name === 'review' || route.name === 'puzzles' || route.name === 'progress') return route.name;
  return null;
}
