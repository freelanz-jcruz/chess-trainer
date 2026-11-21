'use client';
import Link from 'next/link';
import type { Curriculum as CurriculumData, Lesson } from '@/lib/content/schemas';
import { useProgress, type Progress } from '@/lib/progress/store';

function lessonHref(l: Lesson): string | null {
  if (l.status !== 'available') return null;
  if (l.type === 'opening') return `/aperturas/${l.ref}/`;
  if (l.type === 'puzzles') return `/ejercicios/${l.id}/`;
  return null;
}

function lessonProgress(l: Lesson, p: Progress, puzzleIds: Record<string, string[]>): string | null {
  if (l.status !== 'available') return null;
  if (l.type === 'opening') {
    const o = p.openings[l.ref];
    if (!o) return null;
    return o.practiceRuns > 0 ? `practicada ${o.practiceRuns}×` : o.walkthroughDone ? 'vista' : null;
  }
  if (l.type === 'puzzles') {
    const ids = puzzleIds[l.id] ?? [];
    const solved = ids.filter((id) => p.puzzles[id]?.solved).length;
    return `${solved}/${ids.length}`;
  }
  return null;
}

export default function Curriculum({
  curriculum,
  puzzleIds,
}: {
  curriculum: CurriculumData;
  /** Lección de ejercicios -> ids de sus problemas (calculado en el servidor). */
  puzzleIds: Record<string, string[]>;
}) {
  const { progress } = useProgress();
  return (
    <ol className="blocks">
      {curriculum.blocks.map((b) => (
        <li key={b.id} className="block">
          <h2>
            <span className="block-num">{b.id}</span> {b.title}
          </h2>
          <p className="muted small">{b.description}</p>
          <ul className="lessons">
            {b.lessons.map((l) => {
              const href = lessonHref(l);
              const prog = lessonProgress(l, progress, puzzleIds);
              return (
                <li key={l.id} className={href ? 'lesson' : 'lesson soon'}>
                  {href ? <Link href={href}>{l.title}</Link> : <span>{l.title}</span>}
                  {href ? prog && <span className="badge">{prog}</span> : <span className="badge muted">próximamente</span>}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}
