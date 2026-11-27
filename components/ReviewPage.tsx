'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Callout from './Callout';
import PuzzleTrainer from './PuzzleTrainer';
import { Note } from './Trainer';
import { Button } from '@/components/ui/button';
import type { Puzzle } from '@/lib/content/schemas';
import { dueItems, INTERVALS, MAX_BOX, nextDueDay } from '@/lib/progress/review';
import { today, useProgress } from '@/lib/progress/store';
import { useT } from '@/lib/i18n/react';

type OpeningMeta = { id: string; name: string; side: 'white' | 'black' };

const formatDay = (day: string, intlLocale: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString(intlLocale, { weekday: 'long', day: 'numeric', month: 'long' });

/** Lo que toca repasar hoy: aperturas (enlaces a su práctica) y problemas fallados. */
export default function ReviewPage({ openings, puzzles }: { openings: OpeningMeta[]; puzzles: Puzzle[] }) {
  const { progress } = useProgress();
  const t = useT();
  const tr = t.review;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // La lista de problemas de la sesión se fija al entrar, para que no cambie mientras se resuelven.
  const [session, setSession] = useState<Puzzle[] | null>(null);

  const day = today();
  if (!mounted) return <p className="my-4">{tr.loading}</p>;

  const dueOpenings = dueItems(progress.reviews, day, 'opening').flatMap((d) => {
    const o = openings.find((x) => x.id === d.id);
    return o ? [{ ...o, box: d.item.box }] : [];
  });
  const dueIds = new Set(dueItems(progress.reviews, day, 'puzzle').map((d) => d.id));
  const duePuzzles = puzzles.filter((p) => dueIds.has(p.id));
  const tracked = Object.keys(progress.reviews).length;
  const next = nextDueDay(progress.reviews, day);

  return (
    <div>
      <p className="my-4 text-muted-foreground">
        {tr.intro(INTERVALS[MAX_BOX])}
      </p>

      <h2>{tr.openings}</h2>
      {dueOpenings.length ? (
        <ul className="my-3.5 list-disc pl-5">
          {dueOpenings.map((o) => (
            <li key={o.id} className="my-1">
              <Link href={`/aperturas/${o.id}/practica/`}>{o.name}</Link>{' '}
              <span className="text-sm text-muted-foreground">
                {tr.openingMeta(o.side === 'white', o.box, MAX_BOX)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Note className="my-3.5">{tr.noOpenings}</Note>
      )}

      <h2>{tr.puzzles}</h2>
      {session ? (
        <PuzzleTrainer puzzles={session} title={tr.sessionTitle} mode="review" />
      ) : duePuzzles.length ? (
        <p className="my-3.5 flex flex-wrap items-center gap-2.5">
          {tr.puzzlesDue(duePuzzles.length)}{' '}
          <Button onClick={() => setSession(duePuzzles)}>{tr.start}</Button>
        </p>
      ) : (
        <Note className="my-3.5">{tr.noPuzzles}</Note>
      )}

      {!dueOpenings.length && !duePuzzles.length && (
        <Callout tone="correct" className="my-4">
          {tracked === 0
            ? tr.empty
            : tr.allDone(next ? formatDay(next, t.intlLocale) : undefined)}
        </Callout>
      )}
      <Note className="my-3.5">
        {tr.tracked(tracked)}{' '}
        {tracked > 0 &&
          tr.trackedDetail(
            Object.keys(progress.reviews).filter((k) => k.startsWith('opening:')).length,
            Object.keys(progress.reviews).filter((k) => k.startsWith('puzzle:')).length,
          )}
      </Note>
    </div>
  );
}

/** Número de repasos pendientes hoy (para avisos y la cabecera). */
export function useDueCount(): number | null {
  const { progress } = useProgress();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return dueItems(progress.reviews, today()).length;
}

