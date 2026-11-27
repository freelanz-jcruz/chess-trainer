'use client';
import { useCallback, useRef, useState } from 'react';
import { Lightbulb, RotateCcw } from 'lucide-react';
import { Controls, Note, Panel, Statement, Trainer } from '../Trainer';
import { Button } from '@/components/ui/button';
import Board, { type Arrow } from '../board/Board';
import Feedback, { type FeedbackState } from '../Feedback';
import ResultDialog, { useRevealResult } from '../ResultDialog';
import RichText from './RichText';
import { playUci, toUci, turnColor, uciToSquares, withTurn } from '@/lib/chess/game';
import { drillDone, shortestDrill } from '@/lib/chess/drill';
import type { DrillPage } from '@/lib/content/schemas';
import type { PageProps } from './types';

/** Ejercicio de movimiento: el rival no mueve; se cuenta el número de jugadas. */
export default function DrillPageView({ page, onComplete, coordinates, nav, onNext, nextLabel = 'Siguiente', finishTitle }: PageProps<DrillPage>) {
  const me = turnColor(page.fen);
  const [fen, setFen] = useState(page.fen);
  const [moves, setMoves] = useState(0);
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [done, setDone] = useState(false);
  // Texto inicial: qué se espera, en lugar de un recuadro vacío.
  const startText = page.par ? `Tu turno. Objetivo: ${page.par} jugada${page.par === 1 ? '' : 's'}.` : 'Tu turno.';
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', text: startText });
  // Al terminar: ventana de resultado en móvil y el mensaje se desplaza a la vista (ver useRevealResult).
  const [result, setResult] = useState<{ n: number; perfect: boolean } | null>(null);
  const [dialog, setDialog] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  useRevealResult(feedbackRef, done, dialog);

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
        setResult({ n, perfect });
        setDialog(true);
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
    setResult(null);
    setDialog(false);
    setFeedback({ kind: 'idle', text: startText });
  };
  const closeDialog = useCallback(() => setDialog(false), []);
  const nextAction = onNext && { label: nextLabel, onClick: onNext };
  const closeAction = { label: 'Cerrar', onClick: closeDialog };
  const retryAction = { label: 'Intentarlo otra vez', onClick: reset };

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
      {dialog && result && (
        <ResultDialog
          tone="correct"
          title={finishTitle ?? '¡Conseguido!'}
          // Si se pudo en menos jugadas, se propone repetir; si no, seguir.
          primary={!result.perfect ? retryAction : (nextAction ?? { label: 'Continuar', onClick: closeDialog })}
          secondary={!result.perfect ? (nextAction ?? closeAction) : nextAction && closeAction}
          onDismiss={closeDialog}
        >
          {result.perfect
            ? `En ${result.n} jugada${result.n === 1 ? '' : 's'}${page.par ? ': es lo mínimo posible.' : '.'}`
            : `En ${result.n} jugadas. Se puede en ${page.par}: ¿lo intentas otra vez?`}
        </ResultDialog>
      )}
      <Panel>
        <Statement className="prose">
          <RichText text={page.body} />
        </Statement>
        {/* El mensaje de la jugada también va encima del tablero en móvil, bajo el enunciado. */}
        <Statement>
          <Feedback ref={feedbackRef} state={feedback} />
        </Statement>
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
