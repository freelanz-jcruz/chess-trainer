'use client';
import { useCallback, useEffect, useState } from 'react';
import Board, { type Arrow } from '../board/Board';
import Feedback, { type FeedbackState } from '../Feedback';
import RichText from './RichText';
import { opposite, playUci, sanToUci, toUci, turnColor, uciToSquares } from '@/lib/chess/game';
import { sanToEs } from '@/lib/chess/notation-es';
import type { MovePage } from '@/lib/content/schemas';
import { useMoveEvaluator } from '@/lib/engine/use-engine';
import { useTimers } from '@/lib/use-timers';
import type { PageProps } from './types';

const stripSuffix = (san: string) => san.replace(/[+#]$/, '');

/** Encontrar una jugada: de una lista, cualquier buena según Stockfish o cualquier mate. */
export default function MovePageView({ page, onComplete, coordinates, engineTimeMs }: PageProps<MovePage>) {
  const myColor = page.opponentMove ? opposite(turnColor(page.fen)) : turnColor(page.fen);
  const [fen, setFen] = useState(page.fen);
  const [startFen, setStartFen] = useState(page.fen);
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [phase, setPhase] = useState<'intro' | 'user' | 'checking' | 'done'>(page.opponentMove ? 'intro' : 'user');
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [fails, setFails] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle' });
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
      let wrong: FeedbackState = { kind: 'verdict', verdict: 'mistake', san, text: 'No es la jugada que buscamos. Prueba otra vez.' };
      if (page.goal === 'listed') {
        correct = (page.accept ?? []).some((a) => stripSuffix(a) === stripSuffix(played.san));
      } else if (page.goal === 'mate') {
        correct = played.isCheckmate;
        if (!correct) wrong = { kind: 'verdict', verdict: 'mistake', san, text: 'Eso no es mate. Prueba otra vez.' };
      } else {
        setPhase('checking');
        setFeedback({ kind: 'thinking' });
        const r = await evaluate(before, played.fenAfter);
        correct = r.verdict === 'good' || r.best.bestMove === played.uci;
        wrong = { kind: 'verdict', verdict: r.verdict, san, loss: r.loss, reason: r.reason, text: 'Hay algo mejor. Prueba otra vez.' };
      }

      if (correct) {
        cancel();
        setPhase('done');
        setFeedback({ kind: 'verdict', verdict: 'correct', san, text: page.success ?? '¡Bien hecho!' });
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
    setFeedback({ kind: 'idle' });
    setPhase('user');
  };

  return (
    <div className="trainer">
      <Board
        fen={fen}
        orientation={page.orientation ?? myColor}
        movable={phase === 'user' ? myColor : null}
        lastMove={lastMove}
        arrows={arrows}
        coordinates={coordinates}
        onMove={onMove}
      />
      <div className="panel">
        <div className="prose">
          <RichText text={page.body} />
        </div>
        <Feedback state={feedback} />
        <div className="controls">
          <button type="button" onClick={showHint} disabled={phase !== 'user'}>
            💡 Pista
          </button>
          {phase === 'done' && (
            <button type="button" onClick={retry}>
              ↺ Repetir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
