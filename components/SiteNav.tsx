'use client';
import { BookOpen, ChartColumn, History, Puzzle, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useHref, useT } from '@/lib/i18n/react';
import { navSection, parseRoute, type Route } from '@/lib/i18n/routes';
import type { Messages } from '@/lib/i18n';
import { useDueCount } from './ReviewPage';

type Section = 'home' | 'review' | 'puzzles' | 'progress';
type NavItem = { section: Section; route: Route; label: keyof Omit<Messages['nav'], 'label' | 'pending'>; icon: LucideIcon };

// Las lecciones y aperturas cuentan como «Temario»: se abren desde él (ver navSection).
const NAV: NavItem[] = [
  { section: 'home', route: { name: 'home' }, label: 'curriculum', icon: BookOpen },
  { section: 'review', route: { name: 'review' }, label: 'review', icon: History },
  { section: 'puzzles', route: { name: 'puzzles', id: 'todos' }, label: 'puzzles', icon: Puzzle },
  { section: 'progress', route: { name: 'progress' }, label: 'progress', icon: ChartColumn },
];

/** Sección de la página actual (en cualquier idioma). */
function useCurrentSection(): Section | null {
  const parsed = parseRoute(usePathname() ?? '/');
  return parsed && navSection(parsed.route);
}

function DueBadge({ count, className }: { count: number | null; className?: string }) {
  const tn = useT().nav;
  if (!count) return null;
  return (
    <span
      aria-label={tn.pending(count)}
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
  const current = useCurrentSection();
  const due = useDueCount();
  const tn = useT().nav;
  const toHref = useHref();
  return (
    <nav aria-label={tn.label} className="hidden items-center gap-1 md:flex">
      {NAV.map(({ section, route, label }) => {
        const active = current === section;
        const href = toHref(route);
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
            {tn[label]}
            {section === 'review' && <DueBadge count={due} />}
          </Link>
        );
      })}
    </nav>
  );
}

/** Barra de pestañas fija abajo en móvil, al alcance del pulgar. */
export function MobileTabBar() {
  const current = useCurrentSection();
  const due = useDueCount();
  const tn = useT().nav;
  const toHref = useHref();
  return (
    <nav
      aria-label={tn.label}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-[env(safe-area-inset-left)] pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="m-0 grid h-14 list-none grid-cols-4 p-0">
        {NAV.map(({ section, route, label, icon: Icon }) => {
          const active = current === section;
          const href = toHref(route);
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
                  {section === 'review' && <DueBadge count={due} className="absolute -top-1.5 -right-2.5" />}
                </span>
                {tn[label]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
