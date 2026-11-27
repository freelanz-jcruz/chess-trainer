'use client';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Curriculum as CurriculumData, Lesson } from '@/lib/content/schemas';
import { useProgress, type Progress } from '@/lib/progress/store';
import { lessonRoute } from '@/lib/content/links';
import { levelAllows } from '@/lib/content/levels';
import { useHref, useT } from '@/lib/i18n/react';
import type { Messages } from '@/lib/i18n';


function lessonProgress(l: Lesson, p: Progress, puzzleIds: Record<string, string[]>, t: Messages['curriculum']): string | null {
  if (l.status !== 'available') return null;
  if (l.type === 'opening') {
    const o = p.openings[l.ref];
    if (!o) return null;
    return o.practiceRuns > 0 ? t.openingPracticed(o.practiceRuns) : o.walkthroughDone ? t.openingSeen : null;
  }
  if (l.type === 'lesson') {
    const o = p.lessons[l.ref];
    if (!o) return null;
    return o.completed ? t.lessonCompleted : t.lessonStarted;
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
  const t = useT();
  const toHref = useHref();
  return (
    <ol className="my-4 grid gap-6">
      {curriculum.blocks.map((b) => (
        <li key={b.id} className="rounded-lg border-2 border-border bg-card px-4 py-3.5">
          <h2>
            <span className="mr-1 inline-grid size-[1.6em] place-items-center rounded-full bg-primary text-[0.85em] text-primary-foreground">
              {b.id}
            </span> {b.title}
          </h2>
          <p className="my-3.5 text-sm text-muted-foreground">{b.description}</p>
          <ul className="mt-2">
            {b.lessons.filter((l) => levelAllows(progress.settings.level, l.level)).map((l) => {
              const route = lessonRoute(l);
              const href = route && toHref(route);
              const prog = lessonProgress(l, progress, puzzleIds, t.curriculum);
              return (
                <li
                  key={l.id}
                  className={`flex items-center justify-between gap-2 border-t border-border py-1.5 ${href ? '' : 'text-muted-foreground'}`}
                >
                  <span className="flex flex-wrap items-center gap-x-2">
                    {href ? <Link className="no-underline font-medium text-[1.0rem] hover:text-(--hover) py-2" href={href}>{l.title}</Link> : <span>{l.title}</span>}
                    {l.level !== 'principiante' && <Badge variant="muted">{t.level[l.level]}</Badge>}
                  </span>
                  {href ? prog && <Badge>{prog}</Badge> : <Badge variant="muted">{t.curriculum.soon}</Badge>}
                </li>
              );
            })}
            <HiddenByLevel count={b.lessons.filter((l) => !levelAllows(progress.settings.level, l.level)).length} />
          </ul>
        </li>
      ))}
    </ol>
  );
}

/** Pie de bloque con las lecciones ocultas por el nivel elegido, para que no pasen desapercibidas. */
function HiddenByLevel({ count }: { count: number }) {
  const t = useT();
  const href = useHref();
  if (!count) return null;
  return (
    <li className="border-t border-border pt-2.5 pb-1 text-sm text-muted-foreground">
      {t.curriculum.hiddenByLevel(count)} · <Link href={href({ name: 'progress' })}>{t.curriculum.changeLevel}</Link>
    </li>
  );
}
