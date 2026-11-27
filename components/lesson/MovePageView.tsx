'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, RotateCcw } from 'lucide-react';
import { Controls, Note, Panel, Statement, Trainer } from '../Trainer';
import { Button } from '@/components/ui/button';
import Board, { type Arrow } from '../board/Board';
import Feedback, { type FeedbackState } from '../Feedback';
import ResultDialog, { useRevealResult } from '../ResultDialog';
import RichText from './RichText';
import { opposite, playUci, sanToUci, toUci, turnColor, uciToSquares } from '@/lib/chess/game';
import { useSan, useT } from '@/lib/i18n/react';
import type { MovePage } from '@/lib/content/schemas';
import { useMoveEvaluator } from '@/lib/engine/use-engine';
import { useTimers } from '@/lib/use-timers';
import type { PageProps } from './types';

const stripSuffix = (san: string) => san.replace(/[+#]$/, '');

/** Encontrar una jugada: de una lista, cualquier buena según Stockfish o cualquier mate. */
export default function MovePageView({ page, onComplete, coordinates, engineTimeMs, nav, onNext, nextLabel, finishTitle }: PageProps<MovePage>) {
  const tr = useT();
  const tl = tr.lesson;
  const { san: sanToEs } = useSan();
  const myColor = page.opponentMove ? opposite(turnColor(page.fen)) : turnColor(page.fen);
  const [fen, setFen] = useState(page.fen);
  const [startFen, setStartFen] = useState(page.fen);
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [phase, setPhase] = useState<'intro' | 'user' | 'checking' | 'done'>(page.opponentMove ? 'intro' : 'user');
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [fails, setFails] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>({
    kind: 'idle',
    text: page.opponentMove ? tl.watchOpponent : tl.yourTurn,
  });
  // Al acertar: ventana de resultado en móvil y el mensaje se desplaza a la vista (ver useRevealResult).
  const [dialog, setDialog] = useState(false);
  const closeDialog = useCallback(() => setDialog(false), []);
  const feedbackRef = useRef<HTMLDivElement>(null);
  useRevealResult(feedbackRef, phase === 'done', dialog);
  const { later } = useTimers();
  const { preAnalyze, evaluate, analysis, cancel } = useMoveEvaluator(engineTimeMs);
  const needsEngine = page.goal !== 'listed';

  // Jugada previa del rival (p. ej. el avance de dos casillas antes de una captura al paso).
  useEffect(() => {
    if (!page.opponentMove) return;
    later(() => {
      const m = playUci(page.fen, page.opponentMove!);
      if (!m) return;
      setFen(m.fenAfter);
      setStartFen(m.fenAfter);
      setLastMove(uciToSquares(page.opponentMove!));
      setPhase('user');
      setFeedback({ kind: 'idle', text: tl.yourTurn });
    }, 700);
  }, [page, later]);

  useEffect(() => {
    if (phase === 'user' && needsEngine) preAnalyze(fen);
  }, [phase, fen, needsEngine, preAnalyze]);

  const onMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      if (phase !== 'user') return;
      const before = fen;
      const played = playUci(before, toUci(before, from, to, promotion));
      if (!played) return;
      setArrows([]);
      setFen(played.fenAfter);
      setLastMove([from, to]);
      const san = sanToEs(played.san);

      let correct = false;
      let wrong: FeedbackState = { kind: 'verdict', verdict: 'mistake', san, text: tl.notThatMove };
      if (page.goal === 'listed') {
        correct = (page.accept ?? []).some((a) => stripSuffix(a) === stripSuffix(played.san));
      } else if (page.goal === 'mate') {
        correct = played.isCheckmate;
        if (!correct) wrong = { kind: 'verdict', verdict: 'mistake', san, text: tl.notMate };
      } else {
        setPhase('checking');
        setFeedback({ kind: 'thinking' });
        const r = await evaluate(before, played.fenAfter);
        correct = r.verdict === 'good' || r.best.bestMove === played.uci;
        wrong = { kind: 'verdict', verdict: r.verdict, san, loss: r.loss, reason: r.reason, text: tl.somethingBetter };
      }

      if (correct) {
        cancel();
        setPhase('done');
        setFeedback({ kind: 'verdict', verdict: 'correct', san, text: page.success ?? tl.wellDone });
        setDialog(true);
        onComplete();
        return;
      }
      const n = fails + 1;
      setFails(n);
      setPhase('checking');
      setFeedback(n >= 2 && page.hint && wrong.kind === 'verdict' ? { ...wrong, text: page.hint } : wrong);
      later(() => {
        setFen(before);
        setLastMove(null);
        setPhase('user');
      }, 1300);
    },
    [phase, fen, page, evaluate, cancel, onComplete, fails, later],
  );

  const showHint = async () => {
    let uci: string | null = null;
    if (page.goal === 'listed') uci = page.accept?.[0] ? sanToUci(fen, page.accept[0]) : null;
    else uci = (await analysis(fen)).bestMove;
    if (!uci) return;
    const [f, t] = uciToSquares(uci);
    setArrows([{ from: f, to: t }]);
  };

  const retry = () => {
    setFen(startFen);
    setLastMove(null);
    setArrows([]);
    setFeedback({ kind: 'idle', text: tl.yourTurn });
    setPhase('user');
    setDialog(false);
  };

  return (
    <Trainer>
      {dialog && feedback.kind === 'verdict' && (
        <ResultDialog
          tone="correct"
          title={finishTitle ?? tl.correct}
          primary={onNext ? { label: nextLabel ?? tr.common.next, onClick: onNext } : { label: tr.common.continue, onClick: closeDialog }}
          secondary={onNext && { label: tr.common.close, onClick: closeDialog }}
          onDismiss={closeDialog}
        >
          <strong>{feedback.san}</strong> · {feedback.text}
        </ResultDialog>
      )}
      <Board
        fen={fen}
        orientation={page.orientation ?? myColor}
        movable={phase === 'user' ? myColor : null}
        lastMove={lastMove}
        arrows={arrows}
        coordinates={coordinates}
        onMove={onMove}
      />
      <Panel>
        <Statement className="prose">
          <RichText text={page.body} />
        </Statement>
        {/* El mensaje de la jugada también va encima del tablero en móvil, bajo el enunciado. */}
        <Statement>
          <Feedback ref={feedbackRef} state={feedback} />
        </Statement>
        <Controls>
          <Button variant="outline" onClick={showHint} disabled={phase !== 'user'}>
            <Lightbulb /> {tr.common.hint}
          </Button>
          {phase === 'done' && (
            <Button variant="outline" onClick={retry}>
              <RotateCcw /> {tl.repeat}
            </Button>
          )}
        </Controls>
        {nav}
      </Panel>
    </Trainer>
  );
}
