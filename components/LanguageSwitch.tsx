'use client';
import { Languages, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { withBase } from '@/lib/base-path';
import { getMessages, LOCALES, type Locale } from '@/lib/i18n';
import { useLocale, useT } from '@/lib/i18n/react';
import { parseRoute, routeHref } from '@/lib/i18n/routes';

/**
 * Idioma elegido por la persona (aparte del progreso: es de este dispositivo). Si lo eligió, la portada
 * del otro idioma lleva a la suya: así la app instalada (que abre la portada en español) respeta la elección.
 */
const LANG_KEY = 'chess-trainer:lang';

function storedLocale(): Locale | null {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return (LOCALES as readonly string[]).includes(v ?? '') ? (v as Locale) : null;
  } catch {
    return null;
  }
}

function storeLocale(locale: Locale) {
  try {
    localStorage.setItem(LANG_KEY, locale);
  } catch {
    // Sin almacenamiento: la elección vale solo para esta visita.
  }
}

/** La página actual en otro idioma (la portada si no se reconoce la dirección). */
function useAlternateHref(): (target: Locale) => string {
  const path = usePathname() ?? '/';
  const parsed = parseRoute(path);
  return (target) => routeHref(target, parsed?.route ?? { name: 'home' });
}

/** Cambia de idioma: se recarga la página entera (cada idioma tiene su layout raíz). */
function switchTo(target: Locale, href: string) {
  storeLocale(target);
  window.location.assign(withBase(href));
}

/** Enlace del pie a la misma página en los otros idiomas, cada uno con su nombre en su idioma. */
export function LanguageLink() {
  const locale = useLocale();
  const alternate = useAlternateHref();
  const names = useT().language.names;
  return (
    <>
      {LOCALES.filter((l) => l !== locale).map((l) => (
        <a
          key={l}
          href={withBase(alternate(l))}
          hrefLang={l}
          lang={l}
          onClick={(e) => {
            e.preventDefault();
            switchTo(l, alternate(l));
          }}
        >
          {names[l]}
        </a>
      ))}
    </>
  );
}

/** Selector de idioma para Ajustes. */
export function LanguageSelect({ id }: { id?: string }) {
  const locale = useLocale();
  const alternate = useAlternateHref();
  const names = useT().language.names;
  return (
    <Select value={locale} onValueChange={(v) => v !== locale && switchTo(v as Locale, alternate(v as Locale))}>
      <SelectTrigger id={id} className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((l) => (
          <SelectItem key={l} value={l} lang={l}>
            {names[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Primer idioma de la app que aparece en las preferencias del navegador. */
function browserLocale(): Locale | null {
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const pref of prefs) {
    const code = pref.toLowerCase().split('-')[0];
    const match = LOCALES.find((l) => l === code);
    if (match) return match;
  }
  return null;
}

/**
 * Aviso para quien entra en un idioma distinto del de su navegador: ofrece cambiar, escrito en el idioma
 * propuesto, y no redirige solo (ni a buscadores ni a quien tiene el móvil en un idioma que no lee).
 * Responder (cambiar o seguir) cuenta como elección y no vuelve a salir.
 */
export function LanguageSuggest() {
  const locale = useLocale();
  const alternate = useAlternateHref();
  const [offer, setOffer] = useState<Locale | null>(null);

  useEffect(() => {
    const chosen = storedLocale();
    if (chosen) {
      // Idioma ya elegido: la portada del otro idioma (la que abre la app instalada) lleva a la suya.
      if (chosen !== locale && parseRoute(window.location.pathname.slice(withBase('').length) || '/')?.route.name === 'home') {
        window.location.replace(withBase(routeHref(chosen, { name: 'home' })));
      }
      return;
    }
    const preferred = browserLocale();
    if (preferred && preferred !== locale) setOffer(preferred);
  }, [locale]);

  if (!offer) return null;
  // Textos en el idioma propuesto: es el que entiende quien lo va a leer.
  const t = getMessages(offer).language;
  const stay = () => {
    storeLocale(locale);
    setOffer(null);
  };

  // Mismo estilo que el aviso de bienvenida (WelcomeBanner.tsx).
  return (
    <aside
      lang={offer}
      aria-label={t.suggestLabel}
      className="relative my-4 flex items-center gap-4 rounded-2xl border border-primary/60 bg-popover py-4 pr-12 pl-4 text-popover-foreground shadow-2xl"
    >
      <span className="grid size-14 shrink-0 place-content-center rounded-xl bg-primary/15 text-primary">
        <Languages className="size-7" aria-hidden />
      </span>
      <div className="grid min-w-0 flex-1 gap-2">
        <div>
          <p className="m-0 font-semibold">{t.suggestTitle}</p>
          <p className="m-0 text-sm text-muted-foreground">{t.suggestText}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => switchTo(offer, alternate(offer))}>{t.suggestGo}</Button>
          <Button variant="outline" onClick={stay}>
            {t.suggestStay(t.namesHere[locale])}
          </Button>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={stay} aria-label={getMessages(offer).common.close} className="absolute top-2 right-2 text-muted-foreground">
        <X />
      </Button>
    </aside>
  );
}
