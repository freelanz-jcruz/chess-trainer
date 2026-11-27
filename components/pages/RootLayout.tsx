import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { LanguageLink, LanguageSuggest } from '@/components/LanguageSwitch';
import ServiceWorker from '@/components/ServiceWorker';
import { DesktopNav, MobileTabBar } from '@/components/SiteNav';
import { ThemeToggle } from '@/components/Theme';
import ThemeScript from '@/components/ThemeScript';
import { Toaster } from '@/components/ui/sonner';
import { withBase } from '@/lib/base-path';
import { getMessages, type Locale } from '@/lib/i18n';
import { I18nProvider } from '@/lib/i18n/react';
import { localePrefix, routeHref } from '@/lib/i18n/routes';
import { openGraphBase, SITE_ORIGIN } from '@/lib/site';
import { VERSION_LABEL } from '@/lib/version';
import '@/app/globals.css';

// Se descarga al compilar y se sirve desde la app (entra en la caché sin conexión).
const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap', variable: '--font-inter' });

/** Metadatos comunes de un idioma; las páginas añaden su título, canónica y alternativas (lib/site.ts). */
export function rootMetadata(locale: Locale): Metadata {
  const t = getMessages(locale);
  return {
    // Base de las URLs absolutas (canónica, Open Graph): ver lib/site.ts.
    metadataBase: new URL(SITE_ORIGIN),
    title: t.appName,
    description: t.meta.description,
    applicationName: t.appName,
    // Cada idioma tiene su manifiesto: la app instalada desde /en/ se abre en inglés.
    manifest: withBase(`${localePrefix(locale)}/manifest.webmanifest`),
    // Vista previa al compartir el enlace (WhatsApp, redes…); las páginas pueden cambiar título y descripción.
    openGraph: openGraphBase(locale),
    appleWebApp: { capable: true, title: t.meta.appleTitle, statusBarStyle: 'default' },
    icons: {
      icon: [{ url: withBase('/icons/icon-192.png'), sizes: '192x192', type: 'image/png' }],
      apple: [{ url: withBase('/icons/icon-180.png'), sizes: '180x180' }],
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Tema oscuro por defecto; ThemeScript / ThemeToggle lo cambian si se elige el claro.
  themeColor: '#152747',
  // Permite usar env(safe-area-inset-*) para que la barra de pestañas no quede bajo el indicador de inicio.
  viewportFit: 'cover',
};

/**
 * Estructura común de todas las páginas de un idioma. Cada idioma tiene su propio layout raíz
 * (app/(es)/layout.tsx y app/en/layout.tsx) para que el HTML salga ya con su `lang`.
 */
export default function RootLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const t = getMessages(locale);
  return (
    // suppressHydrationWarning: ThemeScript puede añadir data-theme antes de hidratar.
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
        {/* Estadísticas de visitas con Umami (sin cookies). Solo en el build de producción: no cuenta las
            visitas de `npm run dev`. El script sigue solo los cambios de página de la navegación de Next. */}
        {process.env.NODE_ENV === 'production' && (
          <script defer src="https://cloud.umami.is/script.js" data-website-id="639d9298-c563-422a-98b1-ffb1262deb8b" />
        )}
      </head>
      <body className="pb-[var(--tabbar-h)]">
        <I18nProvider locale={locale}>
          <header className="border-b border-border bg-card pt-[env(safe-area-inset-top)]">
            <div className="mx-auto flex h-14 max-w-[960px] items-center gap-4 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
              <Link href={routeHref(locale, { name: 'home' })} className="flex items-center gap-2 font-bold tracking-tight text-foreground no-underline mr-3">
                {/* Marca como máscara: toma el color del texto y se adapta al tema (ver tools/make-icons.py). */}
                <span
                  aria-hidden
                  className="h-7 w-[1.15rem] bg-current mask-(--brand) mask-contain mask-center mask-no-repeat"
                  style={{ '--brand': `url(${withBase('/brand-symbol.png')})` } as React.CSSProperties}
                />
                {t.appName}
              </Link>
              <DesktopNav />
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-[960px] pt-2 pr-[max(1rem,env(safe-area-inset-right))] pb-12 pl-[max(1rem,env(safe-area-inset-left))]">
            <LanguageSuggest />
            {children}
          </main>
          <footer className="mx-auto max-w-[960px] border-t border-border p-4 text-[0.85rem] text-muted-foreground">
            <Link href={routeHref(locale, { name: 'info' })}>{t.footer.about}</Link> ·{' '}
            <Link href={routeHref(locale, { name: 'credits' })}>{t.footer.credits}</Link> · {t.footer.license} ·{' '}
            {/* Versión y commit con el que se compiló (ver next.config.ts): útil para saber qué versión se está viendo. */}
            <span className="tabular-nums" title={t.footer.versionTitle}>
              {VERSION_LABEL}
            </span>{' '}
            · <a target="_blank" href="https://freelanz.es">freelanz.es</a> · <LanguageLink />
          </footer>
          <MobileTabBar />
          <ServiceWorker />
          {/* Arriba: en móvil abajo están la barra de pestañas y los controles del entrenador. */}
          <Toaster position="top-center" offset={{ top: 'calc(env(safe-area-inset-top) + 8px)' }} mobileOffset={{ top: 'calc(env(safe-area-inset-top) + 8px)' }} />
        </I18nProvider>
      </body>
    </html>
  );
}
