'use client';
import Link from 'next/link';
import { chipClass } from './Chip';
import { levelAllows, type Level } from '@/lib/content/levels';
import { useProgress } from '@/lib/progress/store';

type SetLink = { id: string; title: string; level: Level | null };

/**
 * Temas de ejercicios, filtrados por el nivel elegido en Ajustes. El tema abierto se muestra siempre
 * (p. ej. si se llega por un enlace a uno de nivel superior).
 */
export default function PuzzleSetNav({ sets, current }: { sets: SetLink[]; current: string }) {
  const { progress } = useProgress();
  const visible = sets.filter((s) => s.id === current || !s.level || levelAllows(progress.settings.level, s.level));
  return (
    <nav className="mt-2 mb-5 flex flex-wrap gap-1.5" aria-label="Temas">
      {visible.map((s) => (
        <Link key={s.id} href={`/ejercicios/${s.id}/`} className={chipClass(s.id === current)}>
          {s.title}
        </Link>
      ))}
    </nav>
  );
}
