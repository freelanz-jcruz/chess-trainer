'use client';
import Link from 'next/link';
import { Lightbulb, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Board, { type Arrow } from './board/Board';
import Feedback, { type FeedbackState } from './Feedback';
import MoveList from './MoveList';
import PanelExtras from './PanelExtras';
import { Controls, Note, Panel, Statement, Trainer } from './Trainer';
import { Button } from '@/components/ui/button';
import { branchNames, buildLine, resolveStartFen, type LinePly } from '@/lib/chess/opening-line';
import { playUci, toUci, uciToSquares } from '@/lib/chess/game';
import { useSan, useT } from '@/lib/i18n/react';
import type { Opening } from '@/lib/content/schemas';
import { openingForLevel } from '@/lib/content/levels';
import { useMoveEvaluator } from '@/lib/engine/use-engine';
import { currentProgress, scheduleReview, updateOpening, useProgress } from '@/lib/progress/store';

const OPPONENT_DELAY = 550;
const UNDO_DELAY = 1400;

/** Elige al azar una rama en cada punto con ramas, para practicarlas todas con el tiempo. */
const randomLine = (opening: Opening) =>
  buildLine(opening, (_ply, step) => {
    const options = [null, ...(step.branches ?? [])];
    return options[Math.floor(Math.random() * options.length)];
  });

/** El usuario juega su bando de la apertura; la app responde con el libro y valora cada jugada. */
export default function OpeningPractice({ opening: fullOpening }: { opening: Opening }) {
  const { progress, update } = useProgress();
  const t = useT();
  const tx = t.openingPractice;
  const { san: sanToEs } = useSan();
  // Solo las variantes del nivel elegido (y anteriores); las ramas al azar salen de estas.
  const opening = useMemo(() => openingForLevel(fullOpening, progress.settings.level), [fullOpening, progress.settings.level]);
  const myColor = opening.side;
  const myTurnLetter = myColor === 'white' ? 'w' : 'b';
  const startFen = resolveStartFen(opening.startFen);

  const [line, setLine] = useState<LinePly[]>(() => buildLine(opening));
  const [ply, setPly] = useState(0); // próximo medio movimiento de la línea
  const [fen, setFen] = useState(startFen);
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({ kind: 'idle', text: tx.start });
  const [locked, setLocked] = useState(false);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [failsHere, setFailsHere] = useState(0);
  const stats = useRef({ errors: 0, hints: 0 });
  const [finished, setFinished] = useState(false);
  const { preAnalyze, evaluate, cancel } = useMoveEvaluator(progress.settings.engineTimeMs);
  const timers = useRef<number[]>([]);

  // La primera práctica sigue la línea principal (la que enseña el recorrido); las siguientes, ramas al azar.
  // Se elige al montar, en el cliente (el azar no puede ir en el HTML generado al compilar), leyendo el
  // progreso guardado directamente: en el primer render aún se ve el progreso por defecto.
  useEffect(() => {
    const saved = currentProgress();
    if (saved.openings[opening.id]?.practiceRuns) setLine(randomLine(openingForLevel(fullOpening, saved.settings.level)));
    // Solo al entrar en la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const expected = line[ply];
  const done = ply >= line.length;
  const myTurn = !done && expected.color === myTurnLetter;

  // Turno del rival: juega la jugada del libro.
  useEffect(() => {
    if (done || myTurn || locked) return;
    setLocked(true);
    later(() => {
      setFen(expected.fenAfter);
      setLastMove(uciToSquares(expected.uci));
      setPly((p) => p + 1);
      setLocked(false);
    }, OPPONENT_DELAY);
  }, [done, myTurn, locked, expected]);

  // Turno del usuario: el motor empieza a analizar mientras piensa.
  useEffect(() => {
    if (myTurn && !locked) preAnalyze(fen);
  }, [myTurn, locked, fen, preAnalyze]);

  // Fin de la línea.
  useEffect(() => {
    if (!done || finished) return;
    setFinished(true);
    const clean = stats.current.errors === 0 && stats.current.hints === 0;
    const trap = opening.kind === 'trap';
    update((p) =>
      scheduleReview(
        updateOpening(p, opening.id, (o) => ({
          ...o,
          practiceRuns: o.practiceRuns + 1,
          cleanRuns: o.cleanRuns + (clean ? 1 : 0),
        })),
        'opening',
        opening.id,
        clean,
      ),
    );
    setFeedback({
      kind: 'done',
      text: clean
        ? tx.doneClean(trap)
        : tx.doneWith(trap, stats.current.errors, stats.current.hints),
    });
  }, [done, finished, opening.id, opening.kind, update, tx]);

  const onMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      if (!myTurn || locked) return;
      const fenBefore = fen;
      const uci = toUci(fenBefore, from, to, promotion);
      const played = playUci(fenBefore, uci);
      if (!played) return;
      setArrows([]);
      setFen(played.fenAfter);
      setLastMove([from, to]);

      const isBook = played.san === expected.san;
      const isAlternative = expected.alternatives.includes(played.san);
      if (isBook || isAlternative) {
        cancel();
        setFailsHere(0);
        setFeedback({
          kind: 'verdict',
          verdict: 'correct',
          san: sanToEs(played.san),
          text: isBook
            ? expected.note
            : tx.alternative(sanToEs(expected.san)),
        });
        if (isAlternative) {
          setFen(expected.fenAfter);
          setLastMove(uciToSquares(expected.uci));
        }
        setPly((p) => p + 1);
        return;
      }

      // No es la jugada del libro: se valora con Stockfish y se deshace.
      setLocked(true);
      setFeedback({ kind: 'thinking' });
      const result = await evaluate(fenBefore, played.fenAfter);
      stats.current.errors++;
      const fails = failsHere + 1;
      setFailsHere(fails);
      const text =
        result.verdict === 'good'
          ? tx.playableButNotBook
          : fails >= 2
            ? tx.arrowShown
            : t.common.tryAgain;
      setFeedback({
        kind: 'verdict',
        verdict: result.verdict,
        san: sanToEs(played.san),
        loss: result.loss,
        reason: result.reason,
        text,
      });
      later(() => {
        setFen(fenBefore);
        setLastMove(ply > 0 ? uciToSquares(line[ply - 1].uci) : null);
        if (fails >= 2) {
          const [f, t] = uciToSquares(expected.uci);
          setArrows([{ from: f, to: t, brush: 'green' }]);
        }
        setLocked(false);
      }, UNDO_DELAY);
    },
    [myTurn, locked, fen, expected, cancel, evaluate, failsHere, ply, line, sanToEs, tx, t],
  );

  const showHint = () => {
    if (!myTurn) return;
    stats.current.hints++;
    const [f, t] = uciToSquares(expected.uci);
    setArrows([{ from: f, to: t, brush: 'green' }]);
  };

  const restart = () => {
    cancel();
    timers.current.forEach(clearTimeout);
    timers.current = [];
    stats.current = { errors: 0, hints: 0 };
    setLine(randomLine(opening));
    setPly(0);
    setFen(startFen);
    setLastMove(null);
    setArrows([]);
    setFailsHere(0);
    setFinished(false);
    setLocked(false);
    setFeedback({ kind: 'idle', text: tx.start });
  };

  const sans = useMemo(() => line.slice(0, ply).map((p) => p.san), [line, ply]);
  const runs = progress.openings[opening.id];

  return (
    <Trainer>
      <Board
        fen={fen}
        orientation={myColor}
        movable={myTurn && !locked ? myColor : null}
        lastMove={lastMove}
        arrows={arrows}
        coordinates={progress.settings.showCoordinates}
        onMove={onMove}
      />
      <Panel>
        {/* El mensaje de la jugada también va encima del tablero en móvil, bajo el enunciado. */}
        <Statement>
          <Feedback state={feedback} />
        </Statement>
        <Controls>
          <Button variant="outline" onClick={showHint} disabled={!myTurn || locked}>
            <Lightbulb /> {t.common.hint}
          </Button>
          <Button variant="outline" onClick={restart}>
            <RotateCcw /> {t.common.restart}
          </Button>
        </Controls>
        <PanelExtras title={t.common.moves} label={t.common.movesCount(sans.length)}>
          <MoveList sans={sans} current={sans.length - 1} />
          {runs && runs.practiceRuns > 0 && (
            <Note>{tx.runs(runs.practiceRuns, runs.cleanRuns)}</Note>
          )}
        </PanelExtras>
        {done && <Note>{tx.line(branchNames(line))}</Note>}
        {done && (
          <p className="flex flex-wrap items-center gap-2.5">
            <Button onClick={restart}>{t.common.again}</Button>
            <Link href={`/aperturas/${opening.id}/`}>{tx.reviewWalkthrough}</Link>
          </p>
        )}
      </Panel>
    </Trainer>
  );
}
