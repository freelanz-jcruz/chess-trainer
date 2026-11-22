'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PuzzleTrainer from './PuzzleTrainer';
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
  if (!mounted) return <p>Cargando…</p>;

  const dueOpenings = dueItems(progress.reviews, day, 'opening').flatMap((d) => {
    const o = openings.find((x) => x.id === d.id);
    return o ? [{ ...o, box: d.item.box }] : [];
  });
  const dueIds = new Set(dueItems(progress.reviews, day, 'puzzle').map((d) => d.id));
  const duePuzzles = puzzles.filter((p) => dueIds.has(p.id));
  const tracked = Object.keys(progress.reviews).length;
  const next = nextDueDay(progress.reviews, day);

  return (
    <div className="review">
      <p className="muted">
        Repasar lo aprendido a intervalos cada vez más largos ayuda a no olvidarlo. Las aperturas entran en el repaso al
        practicarlas y los problemas, al fallarlos. Si aciertas sin errores ni pistas, vuelven más tarde (1, 3, 7, 14 y{' '}
        {INTERVALS[MAX_BOX]} días); si fallas, mañana.
      </p>

      <h2>Aperturas</h2>
      {dueOpenings.length ? (
        <ul className="review-list">
          {dueOpenings.map((o) => (
            <li key={o.id}>
              <Link href={`/aperturas/${o.id}/practica/`}>{o.name}</Link>{' '}
              <span className="muted small">
                · {o.side === 'white' ? 'blancas' : 'negras'} · caja {o.box} de {MAX_BOX}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted small">Ninguna apertura pendiente hoy.</p>
      )}

      <h2>Problemas</h2>
      {session ? (
        <PuzzleTrainer puzzles={session} title="Repaso" mode="review" />
      ) : duePuzzles.length ? (
        <p>
          Tienes {duePuzzles.length} problema{duePuzzles.length === 1 ? '' : 's'} para repasar.{' '}
          <button type="button" className="button primary" onClick={() => setSession(duePuzzles)}>
            Empezar
          </button>
        </p>
      ) : (
        <p className="muted small">Ningún problema pendiente hoy.</p>
      )}

      {!dueOpenings.length && !duePuzzles.length && (
        <p className="feedback verdict-correct">
          {tracked === 0
            ? 'Todavía no hay nada que repasar. Practica una apertura o resuelve problemas y aparecerán aquí.'
            : `¡Todo al día!${next ? ` El próximo repaso es el ${formatDay(next)}.` : ''}`}
        </p>
      )}
      <p className="muted small">
        Elementos en el repaso: {tracked}.{' '}
        {tracked > 0 && (
          <>
            Aperturas: {Object.keys(progress.reviews).filter((k) => k.startsWith('opening:')).length} · problemas:{' '}
            {Object.keys(progress.reviews).filter((k) => k.startsWith('puzzle:')).length}.
          </>
        )}
      </p>
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

