'use client';
import { useCallback, useState } from 'react';
import { Lightbulb, RotateCcw } from 'lucide-react';
import { Controls, Note, Panel, Statement, Trainer } from '../Trainer';
import { Button } from '@/components/ui/button';
import Board, { type Arrow } from '../board/Board';
import Feedback, { type FeedbackState } from '../Feedback';
import RichText from './RichText';
import { playUci, toUci, turnColor, uciToSquares, withTurn } from '@/lib/chess/game';
import { drillDone, shortestDrill } from '@/lib/chess/drill';
import type { DrillPage } from '@/lib/content/schemas';
import type { PageProps } from './types';

/** Ejercicio de movimiento: el rival no mueve; se cuenta el número de jugadas. */
export default function DrillPageView({ page, onComplete, coordinates, nav }: PageProps<DrillPage>) {
  const me = turnColor(page.fen);
  const [fen, setFen] = useState(page.fen);
  const [moves, setMoves] = useState(0);
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle' });

  const onMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      if (done) return;
      const played = playUci(fen, toUci(fen, from, to, promotion));
      if (!played) return;
      const next = withTurn(played.fenAfter, me);
      const n = moves + 1;
      setFen(next);
      setMoves(n);
      setLastMove([from, to]);
      setArrows([]);
      if (drillDone(page, next)) {
        setDone(true);
        onComplete();
        const perfect = !page.par || n <= page.par;
        setFeedback({
          kind: 'done',
          text: perfect
            ? `¡Conseguido en ${n} jugada${n === 1 ? '' : 's'}!${page.par ? ' Es lo mínimo posible.' : ''}`
            : `¡Conseguido en ${n} jugadas! Se puede en ${page.par}: ¿lo intentas otra vez?`,
        });
      } else {
        setFeedback({ kind: 'idle', text: `Jugadas: ${n}${page.par ? ` · objetivo: ${page.par}` : ''}` });
      }
    },
    [done, fen, me, moves, page, onComplete],
  );

  const showHint = () => {
    const path = shortestDrill(page, fen);
    if (!path?.length) return;
    const [f, t] = uciToSquares(path[0]);
    setArrows([{ from: f, to: t }]);
  };

  const reset = () => {
    setFen(page.fen);
    setMoves(0);
    setLastMove(null);
    setArrows([]);
    setDone(false);
    setFeedback({ kind: 'idle' });
  };

  const target = page.goal.type === 'reach' ? [page.goal.square] : [];

  return (
    <Trainer>
      <Board
        fen={fen}
        orientation={me}
        movable={done ? null : me}
        lastMove={lastMove}
        arrows={arrows}
        highlight={done ? [] : target}
        coordinates={coordinates}
        onMove={onMove}
      />
      <Panel>
        <Statement className="prose">
          <RichText text={page.body} />
        </Statement>
        <Feedback state={feedback} />
        <Controls>
          <Button variant="outline" onClick={showHint} disabled={done}>
            <Lightbulb /> Pista
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw /> Empezar de nuevo
          </Button>
        </Controls>
        {nav}
      </Panel>
    </Trainer>
  );
}
