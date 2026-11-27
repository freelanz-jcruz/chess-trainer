import { es, type Messages } from './es';
import { DEFAULT_LOCALE, type Locale } from './locales';

export type { Messages };
export { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

const MESSAGES: Record<Locale, Messages> = { es };

/** Textos de la interfaz de un idioma. En componentes de cliente, mejor `useT()` (lib/i18n/react.tsx). */
export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return MESSAGES[locale];
}
