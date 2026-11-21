import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import '@lichess-org/chessground/assets/chessground.base.css';
import '@lichess-org/chessground/assets/chessground.cburnett.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chess Trainer',
  description: 'Aprende ajedrez desde cero: aperturas paso a paso y ejercicios valorados con Stockfish.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f3ee' },
    { media: '(prefers-color-scheme: dark)', color: '#1d1b19' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            ♞ Chess Trainer
          </Link>
          <nav>
            <Link href="/">Temario</Link>
            <Link href="/ejercicios/todos/">Ejercicios</Link>
            <Link href="/creditos/">Créditos</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
