'use client';
import { useMemo, useState } from 'react';
import Board from '../board/Board';
import Callout from '../Callout';
import { Panel, Trainer } from '../Trainer';
import { cn } from '@/lib/utils';
import RichText from './RichText';
import { movesFrom } from '@/lib/chess/game';
import { START_FEN } from '@/lib/chess/opening-line';
import type { QuizPage, TextPage } from '@/lib/content/schemas';
import type { PageProps } from './types';

type View = Pick<TextPage, 'fen' | 'orientation' | 'arrows' | 'highlight' | 'showMovesFrom'>;

/** Tablero de solo lectura con flechas y casillas resaltadas. */
export function StaticBoard({ view, coordinates }: { view: View; coordinates: boolean }) {
  const fen = view.fen === 'startpos' || !view.fen ? START_FEN : view.fen;
  const highlight = useMemo(
    () => [...(view.highlight ?? []), ...(view.showMovesFrom ? movesFrom(fen, view.showMovesFrom) : [])],
    [fen, view.highlight, view.showMovesFrom],
  );
  const arrows = useMemo(() => (view.arrows ?? []).map(([from, to]) => ({ from, to })), [view.arrows]);
  return (
    <Board fen={fen} orientation={view.orientation ?? 'white'} movable={null} arrows={arrows} highlight={highlight} coordinates={coordinates} />
  );
}

export function TextPageView({ page, coordinates }: PageProps<TextPage>) {
  return (
    <Layout withBoard={!!page.fen}>
      {page.fen && <StaticBoard view={page} coordinates={coordinates} />}
      <Panel className="prose">
        {page.title && <h2>{page.title}</h2>}
        <RichText text={page.body} />
      </Panel>
    </Layout>
  );
}

export function QuizPageView({ page, onComplete, completed, coordinates }: PageProps<QuizPage>) {
  const [chosen, setChosen] = useState<number | null>(completed ? page.answer : null);
  const right = chosen === page.answer;
  return (
    <Layout withBoard={!!page.fen}>
      {page.fen && <StaticBoard view={page} coordinates={coordinates} />}
      <Panel>
        <div className="prose">
          <RichText text={page.body} />
        </div>
        <div className="grid gap-2">
          {page.options.map((opt, i) => {
            const state = chosen === null ? '' : i === page.answer && right ? 'right' : i === chosen ? 'wrong' : '';
            return (
              <button
                key={i}
                type="button"
                className={cn(
                  'min-h-10 rounded-md border border-border bg-card px-3.5 py-2 text-left transition-colors enabled:hover:bg-accent',
                  state === 'right' && 'border-ok bg-[color-mix(in_srgb,var(--ok)_15%,var(--card))] enabled:hover:bg-[color-mix(in_srgb,var(--ok)_15%,var(--card))]',
                  state === 'wrong' && 'border-mistake bg-[color-mix(in_srgb,var(--mistake)_12%,var(--card))]',
                )}
                disabled={right}
                onClick={() => {
                  setChosen(i);
                  if (i === page.answer) onComplete();
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {chosen !== null && (
          <Callout tone={right ? 'correct' : 'mistake'} role="status">
            {right ? (
              <>
                <strong>¡Correcto!</strong> {page.explain}
              </>
            ) : (
              'No es esa. Prueba otra vez.'
            )}
          </Callout>
        )}
      </Panel>
    </Layout>
  );
}

/** Con tablero: rejilla de entrenador; sin tablero: solo el texto, con ancho de lectura. */
function Layout({ withBoard, children }: { withBoard: boolean; children: React.ReactNode }) {
  return withBoard ? <Trainer>{children}</Trainer> : <div className="mt-3 max-w-[680px]">{children}</div>;
}
