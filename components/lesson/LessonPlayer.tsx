'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { LessonFile, LessonPage } from '@/lib/content/schemas';
import { updateLesson, useProgress } from '@/lib/progress/store';
import { QuizPageView, TextPageView } from './StaticPages';
import MovePageView from './MovePageView';
import DrillPageView from './DrillPageView';
import PlayPageView from './PlayPageView';

/** Las páginas de texto se superan solo con verlas; el resto, resolviéndolas. */
const autoComplete = (p: LessonPage) => p.kind === 'text';

const KIND_LABEL: Record<LessonPage['kind'], string> = {
  text: 'Explicación',
  quiz: 'Pregunta',
  move: 'Tu turno',
  drill: 'Ejercicio',
  play: 'Contra Stockfish',
};

export default function LessonPlayer({ lesson, next }: { lesson: LessonFile; next?: { href: string; title: string } }) {
  const { progress, update } = useProgress();
  const saved = progress.lessons[lesson.id];
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<Set<number>>(() => new Set());
  const [restored, setRestored] = useState(false);

  // Retomar donde se dejó. El progreso de localStorage solo está disponible tras montar en el
  // cliente (durante la hidratación se ve el estado vacío del servidor), así que se espera un render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted || restored) return;
    setRestored(true);
    if (saved && !saved.completed && saved.lastPage > 0) {
      setIndex(Math.min(saved.lastPage, lesson.pages.length - 1));
      setDone(new Set(Array.from({ length: saved.lastPage }, (_, i) => i)));
    }
  }, [mounted, restored, saved, lesson.pages.length]);

  const page = lesson.pages[index];

  // Las páginas de texto cuentan como hechas en cuanto se visitan.
  useEffect(() => {
    if (autoComplete(lesson.pages[index])) setDone((d) => (d.has(index) ? d : new Set(d).add(index)));
  }, [index, lesson.pages]);
  const isLast = index === lesson.pages.length - 1;
  const pageDone = autoComplete(page) || done.has(index) || saved?.completed === true;

  const complete = useCallback(() => {
    setDone((d) => new Set(d).add(index));
  }, [index]);

  // Guardar progreso al avanzar y marcar la lección como completada al superar la última página.
  useEffect(() => {
    if (!restored) return;
    const finished = isLast && pageDone;
    update((p) =>
      updateLesson(p, lesson.id, (o) => ({
        completed: o.completed || finished,
        lastPage: Math.max(index, o.completed ? 0 : o.lastPage),
      })),
    );
  }, [index, isLast, pageDone, lesson.id, restored, update]);

  const go = (i: number) => {
    setIndex(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const common = {
    onComplete: complete,
    completed: pageDone,
    coordinates: progress.settings.showCoordinates,
    engineTimeMs: progress.settings.engineTimeMs,
  };

  return (
    <div className="lesson-player">
      <div className="lesson-progress" aria-label={`Página ${index + 1} de ${lesson.pages.length}`}>
        {lesson.pages.map((p, i) => (
          <button
            key={i}
            type="button"
            className={`dot ${i === index ? 'current' : ''} ${done.has(i) || saved?.completed ? 'done' : ''}`}
            onClick={() => go(i)}
            disabled={i > index && !(saved?.completed || [...Array(i).keys()].every((j) => done.has(j) || autoComplete(lesson.pages[j])))}
            aria-label={`Página ${i + 1}: ${KIND_LABEL[p.kind]}`}
          />
        ))}
      </div>
      <p className="muted small">
        {index + 1}/{lesson.pages.length} · {KIND_LABEL[page.kind]}
      </p>

      {/* key: cada página empieza con su estado limpio */}
      <div key={index}>
        {page.kind === 'text' && <TextPageView page={page} {...common} />}
        {page.kind === 'quiz' && <QuizPageView page={page} {...common} />}
        {page.kind === 'move' && <MovePageView page={page} {...common} />}
        {page.kind === 'drill' && <DrillPageView page={page} {...common} />}
        {page.kind === 'play' && <PlayPageView page={page} {...common} />}
      </div>

      <div className="controls lesson-nav">
        <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>
          ◀ Anterior
        </button>
        {!isLast && (
          <button type="button" className="primary" onClick={() => go(index + 1)} disabled={!pageDone}>
            Siguiente ▶
          </button>
        )}
        {isLast && pageDone && (
          <span className="lesson-end">
            <strong>¡Lección completada!</strong>{' '}
            {next ? (
              <Link className="button primary" href={next.href}>
                Siguiente: {next.title}
              </Link>
            ) : (
              <Link className="button primary" href="/">
                Volver al temario
              </Link>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
