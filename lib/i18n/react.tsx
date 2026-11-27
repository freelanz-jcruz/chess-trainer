'use client';
import { createContext, useCallback, useContext } from 'react';
import { formatMoveList, formatSan } from '@/lib/chess/notation';
import { getMessages, type Messages } from './index';
import { DEFAULT_LOCALE, type Locale } from './locales';

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/**
 * Idioma de la página. Recibe solo el código (los diccionarios llevan funciones y no pueden pasar del
 * servidor al cliente como props); cada componente toma sus textos con `useT()`.
 */
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Textos de la interfaz en el idioma de la página. */
export function useT(): Messages {
  return getMessages(useLocale());
}

/** Notación de las jugadas en el idioma de la página: `san('Nf3')` → «Cf3» en español. */
export function useSan() {
  const locale = useLocale();
  const san = useCallback((s: string) => formatSan(s, locale), [locale]);
  const moveList = useCallback((sans: string[], startPly = 0) => formatMoveList(sans, startPly, locale), [locale]);
  return { san, moveList };
}
