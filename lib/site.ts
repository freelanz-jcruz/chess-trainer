import type { Metadata } from 'next';
import { BASE_PATH } from './base-path';
import { getMessages, LOCALES, type Locale } from './i18n';
import { routeHref, type Route } from './i18n/routes';

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
export function openGraphBase(locale: Locale): NonNullable<Metadata['openGraph']> & { type: 'website' } {
  const t = getMessages(locale);
  return {
    type: 'website',
    siteName: t.appName,
    locale: t.meta.ogLocale,
    alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => getMessages(l).meta.ogLocale),
    images: [{ url: `${BASE_PATH}/icons/icon-512.png`, width: 512, height: 512, alt: t.appName }],
  };
}

/** La misma página en todos los idiomas, para `hreflang` (x-default: el español, en la raíz). */
export function languageAlternates(route: Route): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(routeHref(l, route))])),
    'x-default': absoluteUrl(routeHref('es', route)),
  };
}

/**
 * Metadatos de una página: título, URL canónica, la misma página en los otros idiomas y Open Graph.
 * `title` es el título completo (sin el «· Ajedrez Tutor» si se pasa `fullTitle`).
 */
export function pageMetadata(
  locale: Locale,
  route: Route,
  { title, description, fullTitle = false }: { title: string; description?: string; fullTitle?: boolean },
): Metadata {
  const t = getMessages(locale);
  const shown = fullTitle ? title : t.meta.pageTitle(title);
  const url = absoluteUrl(routeHref(locale, route));
  return {
    title: shown,
    ...(description && { description }),
    alternates: { canonical: url, languages: languageAlternates(route) },
    openGraph: { ...openGraphBase(locale), title: shown, ...(description && { description }), url },
  };
}
