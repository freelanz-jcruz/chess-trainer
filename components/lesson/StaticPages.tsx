'use client';
import { useMemo, useState } from 'react';
import Board from '../board/Board';
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
    <div className={page.fen ? 'trainer' : 'lesson-text-only'}>
      {page.fen && <StaticBoard view={page} coordinates={coordinates} />}
      <div className="panel prose">
        {page.title && <h2>{page.title}</h2>}
        <RichText text={page.body} />
      </div>
    </div>
  );
}

export function QuizPageView({ page, onComplete, completed, coordinates }: PageProps<QuizPage>) {
  const [chosen, setChosen] = useState<number | null>(completed ? page.answer : null);
  const right = chosen === page.answer;
  return (
    <div className={page.fen ? 'trainer' : 'lesson-text-only'}>
      {page.fen && <StaticBoard view={page} coordinates={coordinates} />}
      <div className="panel">
        <div className="prose">
          <RichText text={page.body} />
        </div>
        <div className="quiz-options">
          {page.options.map((opt, i) => {
            const state = chosen === null ? '' : i === page.answer && right ? 'right' : i === chosen ? 'wrong' : '';
            return (
              <button
                key={i}
                type="button"
                className={`quiz-option ${state}`}
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
          <div className={`feedback ${right ? 'verdict-correct' : 'verdict-mistake'}`} role="status">
            {right ? (
              <>
                <strong>¡Correcto!</strong> {page.explain}
              </>
            ) : (
              'No es esa. Prueba otra vez.'
            )}
          </div>
        )}
      </div>
    </div>
  );
}
