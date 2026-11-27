import type { Route } from '@/lib/i18n/routes';
import type { Lesson } from './schemas';

/** Página de cualquier lección disponible del temario (el enlace sale de `routeHref` según el idioma). */
export function lessonRoute(l: Lesson): Route | null {
  if (l.status !== 'available') return null;
  if (l.type === 'opening') return { name: 'opening', id: l.ref };
  if (l.type === 'lesson') return { name: 'lesson', id: l.ref };
  if (l.type === 'puzzles') return { name: 'puzzles', id: l.id };
  return null;
}
