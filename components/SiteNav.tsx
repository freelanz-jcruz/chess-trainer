'use client';
import { BookOpen, ChartColumn, History, Puzzle, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDueCount } from './ReviewPage';

type NavItem = { href: string; label: string; icon: LucideIcon; match: (path: string) => boolean };

const NAV: NavItem[] = [
  {
    href: '/',
    label: 'Temario',
    icon: BookOpen,
    // Las lecciones y aperturas se abren desde el temario.
    match: (p) => p === '/' || p.startsWith('/lecciones/') || p.startsWith('/aperturas/'),
  },
  { href: '/repaso/', label: 'Repaso', icon: History, match: (p) => p.startsWith('/repaso/') },
  { href: '/ejercicios/todos/', label: 'Ejercicios', icon: Puzzle, match: (p) => p.startsWith('/ejercicios/') },
  { href: '/progreso/', label: 'Progreso', icon: ChartColumn, match: (p) => p.startsWith('/progreso/') },
];

/** Ruta actual sin basePath y siempre con barra final, para comparar. */
function useCurrentPath() {
  const path = usePathname() ?? '/';
  return path.endsWith('/') ? path : `${path}/`;
}

function DueBadge({ count, className }: { count: number | null; className?: string }) {
  if (!count) return null;
  return (
    <span
      aria-label={`${count} pendientes`}
      className={cn(
        'inline-grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-none font-semibold text-primary-foreground tabular-nums',
        className,
      )}
    >
      {count}
    </span>
  );
}

/** Enlaces de la cabecera en pantallas medianas y grandes. */
export function DesktopNav() {
  const path = useCurrentPath();
  const due = useDueCount();
  return (
    <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
      {NAV.map(({ href, label, match }) => {
        const active = match(path);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors',
              active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
            )}
          >
            {label}
            {href === '/repaso/' && <DueBadge count={due} />}
          </Link>
        );
      })}
    </nav>
  );
}

/** Barra de pestañas fija abajo en móvil, al alcance del pulgar. */
export function MobileTabBar() {
  const path = useCurrentPath();
  const due = useDueCount();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-[env(safe-area-inset-left)] pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="m-0 grid h-14 list-none grid-cols-4 p-0">
        {NAV.map(({ href, label, icon: Icon, match }) => {
          const active = match(path);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium no-underline transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span className="relative">
                  <Icon aria-hidden size={22} strokeWidth={active ? 2.2 : 1.8} />
                  {href === '/repaso/' && <DueBadge count={due} className="absolute -top-1.5 -right-2.5" />}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
