'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Lightbulb } from 'lucide-react';
import Callout from './Callout';
import { Controls, Note, Panel, Statement, Trainer } from './Trainer';
import { Button } from '@/components/ui/button';
import Board, { type Arrow } from './board/Board';
import Feedback, { type FeedbackState } from './Feedback';
import ResultDialog, { useRevealResult } from './ResultDialog';
import { opposite, playUci, toUci, turnColor, uciToSquares } from '@/lib/chess/game';
import { Fill } from '@/lib/i18n/bold';
import { useSan, useT } from '@/lib/i18n/react';
import type { Puzzle } from '@/lib/content/schemas';
import { useMoveEvaluator } from '@/lib/engine/use-engine';
import { LEVEL_RATING } from '@/lib/content/levels';
import { reviewKey } from '@/lib/progress/review';
import { scheduleReview, today, updatePuzzle, useProgress } from '@/lib/progress/store';

const OPPONENT_DELAY = 600;
const UNDO_DELAY = 1400;

type Phase = 'intro' | 'user' | 'opponent' | 'checking' | 'solved';

/**
 * Resuelve problemas en orden de dificultad. En modo «set», empezando por los que aún no se han
 * resuelto; en modo «review», solo los que tocan hoy en el repaso espaciado.
 */
export default function PuzzleTrainer({
  puzzles,
  title,
  mode = 'set',
  limitToLevel = false,
  onFinished,
}: {
  puzzles: Puzzle[];
  title: string;
  mode?: 'set' | 'review';
  /** Solo los problemas hasta el nivel elegido en Ajustes (para «Todos»). */
  limitToLevel?: boolean;
  /** Modo repaso: no quedan problemas pendientes hoy. */
  onFinished?: () => void;
}) {
  const { progress, update } = useProgress();
  const msg = useT().puzzles;
  const maxRating = limitToLevel ? LEVEL_RATING[progress.settings.level].max : Infinity;
  const ordered = useMemo(
    () => puzzles.filter((p) => p.rating <= maxRating).sort((a, b) => a.rating - b.rating),
    [puzzles, maxRating],
  );
  const solvedCount = ordered.filter((p) => progress.puzzles[p.id]?.solved).length;
  const day = today();
  const isDue = useCallback(
    (id: string) => {
      const r = progress.reviews[reviewKey('puzzle', id)];
      return !!r && r.due <= day;
    },
    [progress.reviews, day],
  );
  const dueCount = ordered.filter((p) => isDue(p.id)).length;

  const pickNext = useCallback(
    (afterId?: string): Puzzle | null => {
      const start = afterId ? ordered.findIndex((p) => p.id === afterId) + 1 : 0;
      const rotated = [...ordered.slice(start), ...ordered.slice(0, start)];
      if (mode === 'review') return rotated.find((p) => isDue(p.id) && p.id !== afterId) ?? null;
      return rotated.find((p) => !progress.puzzles[p.id]?.solved && p.id !== afterId) ?? rotated[0];
    },
    [ordered, progress.puzzles, mode, isDue],
  );

  // El progreso de localStorage solo está disponible tras montar en el cliente:
  // se espera a tenerlo para no ofrecer un problema ya resuelto.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [finished, setFinished] = useState(false);
  const goTo = (p: Puzzle | null) => {
    if (p) setPuzzle(p);
    else {
      setFinished(true);
      onFinished?.();
    }
  };
  useEffect(() => {
    if (mounted && !puzzle && !finished && ordered.length) goTo(pickNext());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, puzzle, finished, ordered.length, pickNext]);

  if (finished)
    return (
      <Callout tone="correct" className="mt-3">
        {dueCount > 0 ? msg.skippedLeft(dueCount) : msg.reviewDone}
      </Callout>
    );
  if (!puzzle) return <p className="my-3">{mounted && !ordered.length ? msg.none : msg.loading}</p>;
  return (
    <PuzzleBoard
      key={puzzle.id}
      puzzle={puzzle}
      header={
        <Note>
          {mode === 'review'
            ? msg.headerReview(title, dueCount, puzzle.rating)
            : msg.headerSet(title, solvedCount, ordered.length, puzzle.rating)}
        </Note>
      }
      onNext={() => goTo(pickNext(puzzle.id))}
      onResult={(r) =>
        update((p) => {
          const next = updatePuzzle(p, puzzle.id, (o) => ({
            solved: o.solved || r.solved,
            firstTry: o.firstTry || (r.solved && r.errors === 0 && !r.hintUsed && o.attempts === 0),
            attempts: o.attempts + 1,
            hintUsed: o.hintUsed || r.hintUsed,
          }));
          // Saltar sin haber jugado no cuenta para el repaso; fallar, usar pista o rendirse, sí.
          const attempted = r.solved || r.errors > 0 || r.hintUsed;
          const clean = r.solved && r.errors === 0 && !r.hintUsed;
          return attempted ? scheduleReview(next, 'puzzle', puzzle.id, clean) : next;
        })
      }
      engineTimeMs={progress.settings.engineTimeMs}
      coordinates={progress.settings.showCoordinates}
    />
  );
}

type Result = { solved: boolean; errors: number; hintUsed: boolean };

function PuzzleBoard({
  puzzle,
  header,
  onNext,
  onResult,
  engineTimeMs,
  coordinates,
}: {
  puzzle: Puzzle;
  header: React.ReactNode;
  onNext: () => void;
  onResult: (r: Result) => void;
  engineTimeMs: number;
  coordinates: boolean;
}) {
  // El usuario juega el bando contrario al que mueve en el FEN original (ese primero lo hace el rival).
  const myColor = opposite(turnColor(puzzle.fen));
  const tr = useT();
  const msg = tr.puzzles;
  const { san: sanToEs } = useSan();
  const isMatePuzzle = puzzle.themes.some((t) => t.startsWith('mateIn') || t === 'mate');

  const [fen, setFen] = useState(puzzle.fen);
  const [step, setStep] = useState(0); // índice en puzzle.solution
  const [phase, setPhase] = useState<Phase>('intro');
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', text: msg.watchOpponent });
  const errors = useRef(0);
  const hintUsed = useRef(false);
  const reported = useRef(false);
  const timers = useRef<number[]>([]);
  const { preAnalyze, evaluate, cancel } = useMoveEvaluator(engineTimeMs);
  // Al resolverlo: ventana de resultado en móvil y el mensaje se desplaza a la vista (ver useRevealResult).
  // Los fallos no la abren: el mensaje queda sobre el tablero y se ve la jugada antes de deshacerla.
  const [dialog, setDialog] = useState(false);
  const closeDialog = useCallback(() => setDialog(false), []);
  const feedbackRef = useRef<HTMLDivElement>(null);
  useRevealResult(feedbackRef, phase === 'solved', dialog);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const report = (solved: boolean) => {
    if (reported.current) return;
    reported.current = true;
    onResult({ solved, errors: errors.current, hintUsed: hintUsed.current });
  };

  const playOpponent = useCallback((fromFen: string, uci: string, nextStep: number) => {
    setPhase('opponent');
    later(() => {
      const m = playUci(fromFen, uci);
      if (!m) return;
      setFen(m.fenAfter);
      setLastMove(uciToSquares(uci));
      setStep(nextStep);
      setPhase('user');
    }, OPPONENT_DELAY);
  }, []);

  // Al empezar: el rival hace la primera jugada del CSV.
  useEffect(() => {
    playOpponent(puzzle.fen, puzzle.opponentMove, 0);
  }, [puzzle, playOpponent]);

  useEffect(() => {
    if (phase !== 'user') return;
    preAnalyze(fen);
    setFeedback((f) =>
      f.kind === 'verdict' ? f : { kind: 'idle', text: msg.yourTurn },
    );
  }, [phase, fen, preAnalyze, myColor]);

  const onMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      if (phase !== 'user') return;
      const expected = puzzle.solution[step];
      const fenBefore = fen;
      const uci = toUci(fenBefore, from, to, promotion);
      const played = playUci(fenBefore, uci);
      if (!played) return;
      setArrows([]);
      setFen(played.fenAfter);
      setLastMove([from, to]);

      // Correcta si es la de la solución, o cualquier mate en un problema de mate (convención de Lichess).
      const correct = uci === expected || (isMatePuzzle && played.isCheckmate);
      if (correct) {
        cancel();
        const isLast = step + 1 >= puzzle.solution.length || played.isCheckmate;
        setFeedback({ kind: 'verdict', verdict: 'correct', san: sanToEs(played.san), text: isLast ? msg.solved : msg.keepGoing });
        if (isLast) {
          setPhase('solved');
          setDialog(true);
          report(true);
        } else {
          playOpponent(played.fenAfter, puzzle.solution[step + 1], step + 2);
        }
        return;
      }

      setPhase('checking');
      setFeedback({ kind: 'thinking' });
      errors.current++;
      const result = await evaluate(fenBefore, played.fenAfter);
      setFeedback({
        kind: 'verdict',
        verdict: result.verdict,
        san: sanToEs(played.san),
        loss: result.loss,
        reason: result.reason,
        text: result.verdict === 'good' ? msg.notBad : tr.common.tryAgain,
      });
      later(() => {
        setFen(fenBefore);
        setLastMove(null);
        setPhase('user');
      }, UNDO_DELAY);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, puzzle, step, fen, isMatePuzzle, cancel, evaluate, playOpponent],
  );

  const showHint = () => {
    if (phase !== 'user') return;
    hintUsed.current = true;
    const [f, t] = uciToSquares(puzzle.solution[step]);
    setArrows([{ from: f, to: t, brush: 'green' }]);
  };

  const next = () => {
    setDialog(false);
    if (phase !== 'solved') report(false);
    cancel();
    onNext();
  };

  return (
    <Trainer>
      {dialog && feedback.kind === 'verdict' && (
        <ResultDialog
          tone="correct"
          title={msg.solved}
          primary={{ label: tr.common.next, onClick: next }}
          secondary={{ label: tr.common.close, onClick: closeDialog }}
          onDismiss={closeDialog}
        >
          <strong>{feedback.san}</strong> · {msg.solvedSummary(errors.current, hintUsed.current)}
        </ResultDialog>
      )}
      <Board
        fen={fen}
        orientation={myColor}
        movable={phase === 'user' ? myColor : null}
        lastMove={lastMove}
        arrows={arrows}
        coordinates={coordinates}
        onMove={onMove}
      />
      <Panel>
        <Statement className="grid gap-1">
          {/* El enunciado, fijo: el resultado de cada jugada va abajo, junto a los botones. */}
          <p className="text-lg font-medium">
            {msg.prompt(myColor === 'white')}
          </p>
          {header}
        </Statement>
        {/* El mensaje de la jugada también va encima del tablero en móvil, bajo el enunciado. */}
        <Statement>
          <Feedback ref={feedbackRef} state={feedback} />
        </Statement>
        <Controls>
          <Button variant="outline" onClick={showHint} disabled={phase !== 'user'}>
            <Lightbulb /> {tr.common.hint}
          </Button>
          <Button variant={phase === 'solved' ? 'default' : 'outline'} onClick={next}>
            {phase === 'solved' ? (
              <>
                {tr.common.next} <ChevronRight />
              </>
            ) : (
              msg.skip
            )}
          </Button>
        </Controls>
        <Note>
          <Fill
            text={msg.source}
            values={{
              link: (
                <a href={`https://lichess.org/training/${puzzle.id}`} target="_blank" rel="noreferrer">
                  #{puzzle.id}
                </a>
              ),
            }}
          />
        </Note>
      </Panel>
    </Trainer>
  );
}
