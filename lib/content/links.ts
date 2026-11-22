import type { Lesson } from './schemas';

/** Enlace de cualquier lección disponible del temario. */
export function lessonHref(l: Lesson): string | null {
  if (l.status !== 'available') return null;
  if (l.type === 'opening') return `/aperturas/${l.ref}/`;
  if (l.type === 'lesson') return `/lecciones/${l.ref}/`;
  if (l.type === 'puzzles') return `/ejercicios/${l.id}/`;
  return null;
}
