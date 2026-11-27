import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeScript from '@/components/ThemeScript';
import { withBase } from '@/lib/base-path';
import { getMessages, LOCALES } from '@/lib/i18n';
import { routeHref } from '@/lib/i18n/routes';
import './globals.css';

/**
 * Página para direcciones que no existen (out/404.html, que sirve el hosting). Con un layout raíz por
 * idioma no hay uno común, así que es una página completa y va en todos los idiomas a la vez.
 */
const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: LOCALES.map((l) => getMessages(l).pages.notFound.title).join(' · '),
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <main className="mx-auto grid max-w-[960px] gap-8 px-4 py-12">
          <img src={withBase('/icons/icon-192.png')} alt="" width={64} height={64} className="size-16 rounded-xl" />
          {LOCALES.map((l) => {
            const t = getMessages(l);
            return (
              <section key={l} lang={l}>
                <h1>{t.pages.notFound.title}</h1>
                {/* Enlace normal (no <Link>): esta página no tiene el enrutador de la app. */}
                <a href={withBase(routeHref(l, { name: 'home' }))}>{t.lesson.backToCurriculum}</a>
              </section>
            );
          })}
        </main>
      </body>
    </html>
  );
}
