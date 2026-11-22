'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { LessonFile, LessonPage } from '@/lib/content/schemas';
import { updateLesson, useProgress } from '@/lib/progress/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Note } from '../Trainer';
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

  const navButtons = (
    <>
      <Button variant="outline" onClick={() => go(index - 1)} disabled={index === 0}>
        <ChevronLeft /> Anterior
      </Button>
      {!isLast && (
        <Button onClick={() => go(index + 1)} disabled={!pageDone}>
          Siguiente <ChevronRight />
        </Button>
      )}
      {isLast && pageDone && (
        <span className="inline-flex flex-wrap items-center gap-2.5">
          <strong>¡Lección completada!</strong>
          <Button asChild>
            {next ? <Link href={next.href}>Siguiente: {next.title}</Link> : <Link href="/">Volver al temario</Link>}
          </Button>
        </span>
      )}
    </>
  );

  const common = {
    nav: <div className="mt-1 hidden flex-wrap items-center gap-2 border-t border-border pt-3 trainer:flex">{navButtons}</div>,
    onComplete: complete,
    completed: pageDone,
    coordinates: progress.settings.showCoordinates,
    engineTimeMs: progress.settings.engineTimeMs,
  };

  return (
    <div>
      <div className="mt-2 flex flex-wrap gap-1.5" aria-label={`Página ${index + 1} de ${lesson.pages.length}`}>
        {lesson.pages.map((p, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              'size-3.5 rounded-full border-2 border-border bg-card disabled:cursor-default disabled:opacity-45',
              (done.has(i) || saved?.completed) && 'border-primary bg-primary',
              i === index && 'outline-2 outline-offset-2 outline-primary',
            )}
            onClick={() => go(i)}
            disabled={i > index && !(saved?.completed || [...Array(i).keys()].every((j) => done.has(j) || autoComplete(lesson.pages[j])))}
            aria-label={`Página ${i + 1}: ${KIND_LABEL[p.kind]}`}
          />
        ))}
      </div>
      <Note className="my-3.5">
        {index + 1}/{lesson.pages.length} · {KIND_LABEL[page.kind]}
      </Note>

      {/* key: cada página empieza con su estado limpio */}
      <div key={index}>
        {page.kind === 'text' && <TextPageView page={page} {...common} />}
        {page.kind === 'quiz' && <QuizPageView page={page} {...common} />}
        {page.kind === 'move' && <MovePageView page={page} {...common} />}
        {page.kind === 'drill' && <DrillPageView page={page} {...common} />}
        {page.kind === 'play' && <PlayPageView page={page} {...common} />}
      </div>

      {/* Móvil: fija abajo, sobre la barra de pestañas, con un degradado para no cortar el contenido en seco.
          En dos columnas va dentro del panel (ver `nav`), para no tapar la parte baja del tablero. */}
      <div className="sticky bottom-(--tabbar-h) z-10 mt-4 flex flex-wrap items-center gap-2 bg-linear-to-b from-transparent to-background to-25% py-2.5 trainer:hidden">
        {navButtons}
      </div>
    </div>
  );
}
