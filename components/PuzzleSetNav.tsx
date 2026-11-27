'use client';
import Link from 'next/link';
import { chipClass } from './Chip';
import { levelAllows, type Level } from '@/lib/content/levels';
import { useProgress } from '@/lib/progress/store';
import { useHref, useT } from '@/lib/i18n/react';

type SetLink = { id: string; title: string; level: Level | null };

/**
 * Temas de ejercicios, filtrados por el nivel elegido en Ajustes. El tema abierto se muestra siempre
 * (p. ej. si se llega por un enlace a uno de nivel superior).
 */
export default function PuzzleSetNav({ sets, current }: { sets: SetLink[]; current: string }) {
  const { progress } = useProgress();
  const t = useT();
  const href = useHref();
  const visible = sets.filter((s) => s.id === current || !s.level || levelAllows(progress.settings.level, s.level));
  return (
    <nav className="mt-2 mb-5 flex flex-wrap gap-1.5" aria-label={t.pages.puzzles.topics}>
      {visible.map((s) => (
        <Link key={s.id} href={href({ name: 'puzzles', id: s.id })} className={chipClass(s.id === current)}>
          {s.title}
        </Link>
      ))}
    </nav>
  );
}
