/**
 * Idiomas de la app. Para añadir uno (p. ej. 'en'): añadirlo aquí, crear su diccionario (lib/i18n/en.ts,
 * con el tipo `Messages`: TypeScript obliga a traducir todas las claves), sus letras de las piezas
 * (lib/chess/notation.ts) y, para el contenido, sus ficheros de frases (ver lib/content/translations.ts).
 */
export const LOCALES = ['es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';
