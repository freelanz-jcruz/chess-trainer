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

type OpeningMeta = { id: string; name: string; side: 'white' | 'black' };

const formatDay = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

/** Lo que toca repasar hoy: aperturas (enlaces a su práctica) y problemas fallados. */
export default function ReviewPage({ openings, puzzles }: { openings: OpeningMeta[]; puzzles: Puzzle[] }) {
  const { progress } = useProgress();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // La lista de problemas de la sesión se fija al entrar, para que no cambie mientras se resuelven.
  const [session, setSession] = useState<Puzzle[] | null>(null);

  const day = today();
  if (!mounted) return <p className="my-4">Cargando…</p>;

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
        Repasar lo aprendido a intervalos cada vez más largos ayuda a no olvidarlo. Las aperturas entran en el repaso al
        practicarlas y los problemas, al fallarlos. Si aciertas sin errores ni pistas, vuelven más tarde (1, 3, 7, 14 y{' '}
        {INTERVALS[MAX_BOX]} días); si fallas, mañana.
      </p>

      <h2>Aperturas</h2>
      {dueOpenings.length ? (
        <ul className="my-3.5 list-disc pl-5">
          {dueOpenings.map((o) => (
            <li key={o.id} className="my-1">
              <Link href={`/aperturas/${o.id}/practica/`}>{o.name}</Link>{' '}
              <span className="text-sm text-muted-foreground">
                · {o.side === 'white' ? 'blancas' : 'negras'} · caja {o.box} de {MAX_BOX}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Note className="my-3.5">Ninguna apertura pendiente hoy.</Note>
      )}

      <h2>Problemas</h2>
      {session ? (
        <PuzzleTrainer puzzles={session} title="Repaso" mode="review" />
      ) : duePuzzles.length ? (
        <p className="my-3.5 flex flex-wrap items-center gap-2.5">
          Tienes {duePuzzles.length} problema{duePuzzles.length === 1 ? '' : 's'} para repasar.{' '}
          <Button onClick={() => setSession(duePuzzles)}>Empezar</Button>
        </p>
      ) : (
        <Note className="my-3.5">Ningún problema pendiente hoy.</Note>
      )}

      {!dueOpenings.length && !duePuzzles.length && (
        <Callout tone="correct" className="my-4">
          {tracked === 0
            ? 'Todavía no hay nada que repasar. Practica una apertura o resuelve problemas y aparecerán aquí.'
            : `¡Todo al día!${next ? ` El próximo repaso es el ${formatDay(next)}.` : ''}`}
        </Callout>
      )}
      <Note className="my-3.5">
        Elementos en el repaso: {tracked}.{' '}
        {tracked > 0 && (
          <>
            Aperturas: {Object.keys(progress.reviews).filter((k) => k.startsWith('opening:')).length} · problemas:{' '}
            {Object.keys(progress.reviews).filter((k) => k.startsWith('puzzle:')).length}.
          </>
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

