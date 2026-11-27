import type { Locale } from '@/lib/i18n/locales';
import type { ContentTranslations } from '@/lib/content/translations';

/**
 * Registro de traducciones del contenido por idioma (ver lib/content/translations.ts). El español no
 * aparece: es el original. Al añadir un idioma, se importan aquí sus ficheros de frases, p. ej.:
 *
 *   import enCurriculum from './en/curriculum.json';
 *   import enPiezas from './en/lessons/piezas.json';
 *   en: { curriculum: enCurriculum, lessons: { piezas: enPiezas } },
 */
export const CONTENT_TRANSLATIONS: Partial<Record<Locale, ContentTranslations>> = {};
