'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, RotateCcw } from 'lucide-react';
import { Controls, Note, Panel, Statement, Trainer } from '../Trainer';
import { Button } from '@/components/ui/button';
import Board, { type Arrow } from '../board/Board';
import Feedback, { type FeedbackState } from '../Feedback';
import ResultDialog, { useRevealResult } from '../ResultDialog';
import RichText from './RichText';
import { opposite, playUci, toUci, turnColor, uciToSquares } from '@/lib/chess/game';
import { useSan, useT } from '@/lib/i18n/react';
import type { PlayPage } from '@/lib/content/schemas';
import { getEngine } from '@/lib/engine/browser';
import type { Score } from '@/lib/engine/uci';
import { useMoveEvaluator } from '@/lib/engine/use-engine';
import { useTimers } from '@/lib/use-timers';
import type { PageProps } from './types';

const OPPONENT_TIME = 400;
const UNDO_DELAY = 1600;
/** Ventaja mínima (en peones) para considerar que la posición sigue ganada. */
const WIN_THRESHOLD = 2;

/** `score` es para el rival, que mueve después de nuestra jugada. */
function stillWinning(score: Score): boolean {
  if (score.type === 'mate') return score.value < 0;
  return -score.value / 100 >= WIN_THRESHOLD;
}

type Phase = 'intro' | 'user' | 'checking' | 'opponent' | 'won' | 'lost';

/** Jugar contra Stockfish desde una posición hasta dar mate (o coronar). */
export default function PlayPageView({ page, onComplete, coordinates, engineTimeMs, nav, onNext, nextLabel, finishTitle }: PageProps<PlayPage>) {
  const tr = useT();
  const tl = tr.lesson;
  const { san: sanToEs } = useSan();
  const myColor = page.opponentMove ? opposite(turnColor(page.fen)) : turnColor(page.fen);
  const [fen, setFen] = useState(page.fen);
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [moves, setMoves] = useState(0);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle' });
  const [round, setRound] = useState(0); // para reiniciar
  const [hintShown, setHintShown] = useState(false); // el texto de la pista solo aparece al pedirla
  // Al terminar (ganada o sin jugadas): ventana de resultado en móvil y el mensaje se desplaza a la vista (ver useRevealResult).
  const [dialog, setDialog] = useState(false);
  const closeDialog = useCallback(() => setDialog(false), []);
  const feedbackRef = useRef<HTMLDivElement>(null);
  useRevealResult(feedbackRef, phase === 'won' || phase === 'lost', dialog);
  const { later, clear } = useTimers();
  const { preAnalyze, analysis, cancel } = useMoveEvaluator(engineTimeMs);

  const goalText = tl.goal(page.goal === 'checkmate', page.maxMoves);

  useEffect(() => {
    setFen(page.fen);
    setLastMove(null);
    setMoves(0);
    setArrows([]);
    setFeedback({ kind: 'idle', text: goalText });
    if (!page.opponentMove) {
      setPhase('user');
      return;
    }
    setPhase('intro');
    later(() => {
      const m = playUci(page.fen, page.opponentMove!);
      if (!m) return;
      setFen(m.fenAfter);
      setLastMove(uciToSquares(page.opponentMove!));
      setPhase('user');
    }, 700);
  }, [page, round, later, goalText]);

  useEffect(() => {
    if (phase === 'user') preAnalyze(fen);
  }, [phase, fen, preAnalyze]);

  const undo = (before: string, prevLast: [string, string] | null) =>
    later(() => {
      setFen(before);
      setLastMove(prevLast);
      setPhase('user');
    }, UNDO_DELAY);

  const onMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      if (phase !== 'user') return;
      const before = fen;
      const prevLast = lastMove;
      const played = playUci(before, toUci(before, from, to, promotion));
      if (!played) return;
      setArrows([]);
      setFen(played.fenAfter);
      setLastMove([from, to]);
      const san = sanToEs(played.san);
      const n = moves + 1;

      const won = page.goal === 'checkmate' ? played.isCheckmate : played.promotion;
      if (won) {
        cancel();
        setMoves(n);
        setPhase('won');
        setFeedback({ kind: 'done', text: tl.achievedIn(n) });
        setDialog(true);
        onComplete();
        return;
      }
      if (played.isStalemate) {
        setPhase('checking');
        setFeedback({
          kind: 'verdict',
          verdict: 'blunder',
          san,
          text: tl.stalemate,
        });
        undo(before, prevLast);
        return;
      }

      setPhase('checking');
      setFeedback({ kind: 'thinking' });
      if (page.strict && page.maxMoves) {
        // Mate en N: debe seguir habiendo mate dentro de las jugadas que quedan.
        const after = await getEngine().analyze(played.fenAfter, { movetime: engineTimeMs });
        const left = page.maxMoves - n;
        const keepsMate = after.score.type === 'mate' && after.score.value < 0 && -after.score.value <= left;
        if (!keepsMate) {
          setFeedback({ kind: 'verdict', verdict: 'mistake', san, text: tl.noMateIn(page.maxMoves!) });
          undo(before, prevLast);
          return;
        }
      } else {
        // Solo importa no dejar escapar la victoria. No se compara con la mejor jugada: en los finales
        // conocidos (rey y peón contra rey) Stockfish da cifras muy distintas a posiciones igual de ganadas.
        cancel();
        const after = await getEngine().analyze(played.fenAfter, { movetime: engineTimeMs });
        if (!stillWinning(after.score)) {
          setFeedback({ kind: 'verdict', verdict: 'blunder', san, text: tl.winSlips });
          undo(before, prevLast);
          return;
        }
      }

      setMoves(n);
      if (page.maxMoves && n >= page.maxMoves) {
        setPhase('lost');
        setFeedback({ kind: 'verdict', verdict: 'mistake', san, text: tl.outOfMoves });
        setDialog(true);
        return;
      }
      // Responde Stockfish.
      setPhase('opponent');
      setFeedback({ kind: 'idle', text: tl.movesSoFar(n, page.maxMoves) });
      const reply = await getEngine().analyze(played.fenAfter, { movetime: OPPONENT_TIME });
      if (!reply.bestMove) return;
      const m = playUci(played.fenAfter, reply.bestMove);
      if (!m) return;
      setFen(m.fenAfter);
      setLastMove(uciToSquares(reply.bestMove));
      setPhase('user');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, fen, lastMove, moves, page, engineTimeMs, cancel, onComplete],
  );

  const showHint = async () => {
    setHintShown(true);
    const a = await analysis(fen);
    if (!a.bestMove) return;
    const [f, t] = uciToSquares(a.bestMove);
    setArrows([{ from: f, to: t }]);
  };

  const restart = () => {
    clear();
    cancel();
    setHintShown(false);
    setDialog(false);
    setRound((r) => r + 1);
  };

  return (
    <Trainer>
      {dialog && phase === 'won' && (
        <ResultDialog
          tone="correct"
          title={finishTitle ?? tl.achieved}
          primary={onNext ? { label: nextLabel ?? tr.common.next, onClick: onNext } : { label: tr.common.continue, onClick: closeDialog }}
          secondary={onNext && { label: tr.common.close, onClick: closeDialog }}
          onDismiss={closeDialog}
        >
          {tl.wonSummary(page.goal === 'checkmate', moves)}
        </ResultDialog>
      )}
      {dialog && phase === 'lost' && (
        <ResultDialog
          tone="mistake"
          title={tl.outOfMovesTitle}
          primary={{ label: tr.common.restart, onClick: restart }}
          secondary={{ label: tr.common.close, onClick: closeDialog }}
          onDismiss={closeDialog}
        >
          {tl.notAchievedIn(page.maxMoves ?? 0)}
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
          <Button variant="outline" onClick={restart}>
            <RotateCcw /> {tr.common.restart}
          </Button>
        </Controls>
        {hintShown && page.hint && <Note>{page.hint}</Note>}
        {nav}
      </Panel>
    </Trainer>
  );
}
