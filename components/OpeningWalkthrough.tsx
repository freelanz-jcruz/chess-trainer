'use client';
import { ChevronLeft, ChevronRight, ChevronsLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Board from './board/Board';
import MoveList from './MoveList';
import Callout from './Callout';
import { chipClass } from './Chip';
import PanelExtras from './PanelExtras';
import { Controls, Note, Panel, Statement, Trainer } from './Trainer';
import { Button } from '@/components/ui/button';
import { branchNames, buildLine, resolveStartFen } from '@/lib/chess/opening-line';
import { sanToEs } from '@/lib/chess/notation-es';
import { uciToSquares } from '@/lib/chess/game';
import type { Opening } from '@/lib/content/schemas';
import { updateOpening, useProgress } from '@/lib/progress/store';

/** Recorrido paso a paso de una apertura con una frase breve por jugada. */
export default function OpeningWalkthrough({ opening }: { opening: Opening }) {
  // Rama elegida en cada punto de elección (medio movimiento -> id de rama; ausente = principal).
  const [choices, setChoices] = useState<Record<number, string>>({});
  const line = useMemo(
    () => buildLine(opening, (ply, step) => step.branches?.find((b) => b.id === choices[ply]) ?? null),
    [opening, choices],
  );
  const [index, setIndex] = useState(-1); // -1 = posición inicial
  const { progress, update } = useProgress();

  const atEnd = index === line.length - 1;
  useEffect(() => {
    if (atEnd && !progress.openings[opening.id]?.walkthroughDone) {
      update((p) => updateOpening(p, opening.id, (o) => ({ ...o, walkthroughDone: true })));
    }
  }, [atEnd, opening.id, progress.openings, update]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(line.length - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(-1, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [line.length]);

  const ply = index >= 0 ? line[index] : null;
  const fen = ply ? ply.fenAfter : resolveStartFen(opening.startFen);
  const moveNumber = ply ? `${Math.floor(ply.ply / 2) + 1}${ply.color === 'w' ? '.' : '...'}` : '';
  const numberFor = (p: number) => `${Math.floor(p / 2) + 1}${p % 2 === 0 ? '.' : '...'}`;
  const next = line[index + 1];
  const names = branchNames(line);

  /** Cambia de rama en el medio movimiento `at` y olvida las elecciones posteriores. */
  const choose = (at: number, id: string | null) => {
    setChoices((c) => {
      const kept = Object.fromEntries(Object.entries(c).filter(([k]) => Number(k) < at));
      return id ? { ...kept, [at]: id } : kept;
    });
  };

  return (
    <Trainer>
      <Board
        fen={fen}
        orientation={opening.side}
        movable={null}
        lastMove={ply ? uciToSquares(ply.uci) : null}
        coordinates={progress.settings.showCoordinates}
      />
      <Panel>
        <Statement>
          <Callout aria-live="polite">
            {ply ? (
              <>
                <strong>
                  {moveNumber}
                  {sanToEs(ply.san)}
                </strong>{' '}
                {ply.note}
              </>
            ) : (
              <>{opening.summary} Pulsa «Siguiente» para empezar.</>
            )}
          </Callout>
        </Statement>
        <Controls>
          <Button variant="outline" size="icon" className="size-10" onClick={() => setIndex(-1)} disabled={index < 0} aria-label="Al principio">
            <ChevronsLeft />
          </Button>
          <Button variant="outline" onClick={() => setIndex(index - 1)} disabled={index < 0}>
            <ChevronLeft /> Anterior
          </Button>
          <Button onClick={() => setIndex(index + 1)} disabled={atEnd}>
            Siguiente <ChevronRight />
          </Button>
        </Controls>
        {/* El selector de variantes también va encima del tablero en móvil. */}
        {next?.choice && (
          <Statement className="rounded-lg border border-dashed border-border px-3 py-2.5">
            <Note className="mb-1.5">Aquí la partida puede seguir de varias formas:</Note>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                className={chipClass(next.choice.chosen === null)}
                aria-pressed={next.choice.chosen === null}
                onClick={() => choose(next.ply, null)}
              >
                {numberFor(next.ply)}
                {sanToEs(next.choice.mainSan)} · principal
              </button>
              {next.choice.options.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={chipClass(next.choice!.chosen === b.id)}
                  aria-pressed={next.choice!.chosen === b.id}
                  onClick={() => choose(next.ply, b.id)}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </Statement>
        )}
        <PanelExtras title="Jugadas de la línea" label={`Jugadas · ${index + 1}/${line.length}`} description="Toca una jugada para verla en el tablero.">
          <Note>Línea: {names.length ? names.join(' › ') : 'principal'}</Note>
          <MoveList sans={line.map((p) => p.san)} current={index} onSelect={setIndex} />
        </PanelExtras>
        {atEnd && (
          <p className="flex flex-wrap items-center gap-2.5">
            Has visto toda la línea.
            <Button asChild>
              <Link href={`/aperturas/${opening.id}/practica/`}>Practicar ahora</Link>
            </Button>
          </p>
        )}
      </Panel>
    </Trainer>
  );
}
