import type { Locale } from '@/lib/i18n/locales';

/**
 * Traducción de los contenidos (temario, lecciones, aperturas). El español es el original y vive en
 * content/; cada idioma añade ficheros de frases en content/i18n/<idioma>/, uno por fichero de contenido:
 *
 *   content/i18n/en/curriculum.json
 *   content/i18n/en/lessons/<id>.json
 *   content/i18n/en/openings/<id>.json
 *
 * Cada fichero de frases es un objeto { ruta: { from, to } }. La ruta señala un campo de texto del original
 * (`pages.3.body`, `steps.5.branches.0.name`, `blocks.0.lessons.2.title`…), `from` es el texto español
 * del que se tradujo y `to`, la traducción. Lo que no esté traducido se muestra en español.
 * `npm run validate` avisa de rutas que ya no existen y de traducciones cuyo original ha cambiado
 * (`from` distinto del texto actual); `npm run i18n:template -- <idioma>` crea o completa los ficheros.
 */

/** Campos con texto para el lector. El resto (ids, FEN, jugadas, niveles…) no se traduce. */
export const TEXT_FIELDS = new Set([
  'title',
  'name',
  'summary',
  'description',
  'body',
  'options',
  'explain',
  'hint',
  'success',
  'note',
]);

export type Phrase = { from: string; to: string };
export type Phrases = Record<string, Phrase>;

/** Frases de un idioma: el temario y una entrada por lección o apertura (por id). */
export type ContentTranslations = {
  curriculum?: Phrases;
  lessons?: Record<string, Phrases>;
  openings?: Record<string, Phrases>;
};

/** Todos los textos traducibles de un contenido, con su ruta. */
export function textEntries(data: unknown, path: string[] = [], inText = false): [string, string][] {
  if (typeof data === 'string') return inText ? [[path.join('.'), data]] : [];
  if (Array.isArray(data)) return data.flatMap((v, i) => textEntries(v, [...path, String(i)], inText));
  if (data && typeof data === 'object') {
    return Object.entries(data).flatMap(([k, v]) => textEntries(v, [...path, k], TEXT_FIELDS.has(k)));
  }
  return [];
}

/**
 * Copia del contenido con las frases traducidas. Solo se aplica una traducción si su `from` coincide con
 * el texto actual: si el original cambió, se muestra el español hasta revisarla.
 */
export function applyPhrases<T>(data: T, phrases: Phrases | undefined): T {
  if (!phrases || !Object.keys(phrases).length) return data;
  const walk = (value: unknown, path: string): unknown => {
    if (typeof value === 'string') {
      const p = phrases[path];
      return p && p.from === value && p.to ? p.to : value;
    }
    if (Array.isArray(value)) return value.map((v, i) => walk(v, path ? `${path}.${i}` : String(i)));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, path ? `${path}.${k}` : k)]));
    }
    return value;
  };
  return walk(data, '') as T;
}

/** Problemas de un fichero de frases frente a su original: rutas que no existen, originales cambiados y frases sin traducir. */
export function checkPhrases(data: unknown, phrases: Phrases): { unknown: string[]; outdated: string[]; missing: string[] } {
  const source = new Map(textEntries(data));
  const unknown = Object.keys(phrases).filter((k) => !source.has(k));
  const outdated = Object.entries(phrases)
    .filter(([k, p]) => source.has(k) && p.from !== source.get(k))
    .map(([k]) => k);
  // Sin traducción utilizable: vacía o desfasada (las desfasadas se muestran en español).
  const missing = [...source.entries()].filter(([k, text]) => !phrases[k]?.to || phrases[k].from !== text).map(([k]) => k);
  return { unknown, outdated, missing };
}

export type { Locale };
