import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import ServiceWorker from '@/components/ServiceWorker';
import { DesktopNav, MobileTabBar } from '@/components/SiteNav';
import { ThemeToggle } from '@/components/Theme';
import ThemeScript from '@/components/ThemeScript';
import { Toaster } from '@/components/ui/sonner';
import { withBase } from '@/lib/base-path';
import './globals.css';

// Se descarga al compilar y se sirve desde la app (entra en la caché sin conexión).
const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Ajedrez Tutor',
  description: 'Aprende ajedrez desde cero: aperturas paso a paso y ejercicios valorados con Stockfish.',
  applicationName: 'Ajedrez Tutor',
  appleWebApp: { capable: true, title: 'Ajedrez', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: withBase('/icons/icon-192.png'), sizes: '192x192', type: 'image/png' }],
    apple: [{ url: withBase('/icons/icon-180.png'), sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Tema oscuro por defecto; ThemeScript / ThemeToggle lo cambian si se elige el claro.
  themeColor: '#1d1b19',
  // Permite usar env(safe-area-inset-*) para que la barra de pestañas no quede bajo el indicador de inicio.
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: ThemeScript puede añadir data-theme antes de hidratar.
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="pb-[var(--tabbar-h)]">
        <header className="border-b border-border bg-card pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-14 max-w-[960px] items-center gap-4 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-foreground no-underline">
              {/* Marca como máscara: toma el color del texto y se adapta al tema (ver tools/make-icons.py). */}
              <span
                aria-hidden
                className="h-7 w-[1.15rem] bg-current mask-(--brand) mask-contain mask-center mask-no-repeat"
                style={{ '--brand': `url(${withBase('/brand-symbol.png')})` } as React.CSSProperties}
              />
              Ajedrez Tutor
            </Link>
            <DesktopNav />
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[960px] pt-2 pr-[max(1rem,env(safe-area-inset-right))] pb-12 pl-[max(1rem,env(safe-area-inset-left))]">{children}</main>
        <footer className="mx-auto max-w-[960px] border-t border-border p-4 text-[0.85rem] text-muted-foreground">
          <Link href="/creditos/">Créditos</Link> · Software libre (GPL-3)
        </footer>
        <MobileTabBar />
        <ServiceWorker />
        {/* Arriba: en móvil abajo están la barra de pestañas y los controles del entrenador. */}
        <Toaster position="top-center" offset={{ top: 'calc(env(safe-area-inset-top) + 8px)' }} mobileOffset={{ top: 'calc(env(safe-area-inset-top) + 8px)' }} />
      </body>
    </html>
  );
}
