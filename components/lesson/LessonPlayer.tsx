'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { LessonFile, LessonPage } from '@/lib/content/schemas';
import { updateLesson, useProgress } from '@/lib/progress/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useHref, useT } from '@/lib/i18n/react';
import { Note } from '../Trainer';
import ResultDialog, { TWO_COLUMNS } from '../ResultDialog';
import { QuizPageView, TextPageView } from './StaticPages';
import MovePageView from './MovePageView';
import DrillPageView from './DrillPageView';
import PlayPageView from './PlayPageView';

/** Las páginas de texto se superan solo con verlas; el resto, resolviéndolas. */
const autoComplete = (p: LessonPage) => p.kind === 'text';

export default function LessonPlayer({ lesson, next }: { lesson: LessonFile; next?: { href: string; title: string } }) {
  const { progress, update } = useProgress();
  const tr = useT();
  const href = useHref();
  const tl = tr.lesson;
  const router = useRouter();
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

  // Al cambiar de página con los botones, se vuelve arriba para leer el nuevo enunciado. Se hace tras pintar
  // la página nueva y sin animación: un desplazamiento suave lanzado antes del cambio se interrumpe en
  // algunos navegadores (Safari en iPhone) cuando cambia la altura del contenido.
  const scrollPending = useRef(false);
  const go = (i: number) => {
    scrollPending.current = true;
    setIndex(i);
  };
  useLayoutEffect(() => {
    if (!scrollPending.current) return;
    scrollPending.current = false;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [index]);

  const navButtons = (
    <>
      <Button className="text-base" variant="outline" onClick={() => go(index - 1)} disabled={index === 0}>
        <ChevronLeft /> {tr.common.previous}
      </Button>
      {!isLast && (
        <Button className="text-base" onClick={() => go(index + 1)} disabled={!pageDone}>
          {tr.common.next} <ChevronRight />
        </Button>
      )}
      {isLast && pageDone && (
        <span className="inline-flex flex-wrap items-center gap-2.5">
          <strong>{tl.completed}</strong>
          <Button asChild className="h-auto min-h-9 max-w-64 py-1.5 whitespace-normal">
            {next ? (
              <Link href={next.href}>
                <NextLessonLabel title={next.title} />
              </Link>
            ) : (
              <Link href={href({ name: 'home' })}>{tl.backToCurriculum}</Link>
            )}
          </Button>
        </span>
      )}
    </>
  );

  // Al terminar la lección, la ventana de resultado (móvil) ofrece ir a la siguiente lección.
  const nextHref = next?.href ?? href({ name: 'home' });
  const nextLabel = next ? <NextLessonLabel title={next.title} /> : tl.backToCurriculum;
  const goNextLesson = useCallback(() => router.push(nextHref), [router, nextHref]);

  // Si la última página es de texto (un resumen), no hay ventana de resultado: se abre una al llegar al
  // final del resumen, una vez por visita.
  const endRef = useRef<HTMLDivElement>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const finishShown = useRef(false);
  const lastIsText = isLast && autoComplete(page);
  useEffect(() => {
    const end = endRef.current;
    if (!lastIsText || finishShown.current || !end || window.matchMedia(TWO_COLUMNS).matches) return;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearTimeout(timer);
      if (!entry.isIntersecting) return;
      // Tiempo para leer el resumen antes de taparlo (suele caber entero en la pantalla).
      timer = window.setTimeout(() => {
        finishShown.current = true;
        setFinishOpen(true);
        observer.disconnect();
      }, 4000);
    });
    observer.observe(end);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [lastIsText, index]);
  const closeFinish = useCallback(() => setFinishOpen(false), []);

  const common = {
    nav: <div className="mt-1 hidden flex-wrap items-center gap-2 border-t border-border pt-3 trainer:flex">{navButtons}</div>,
    onComplete: complete,
    onNext: isLast ? goNextLesson : () => go(index + 1),
    nextLabel: isLast ? nextLabel : undefined,
    finishTitle: isLast ? tl.completed : undefined,
    completed: pageDone,
    coordinates: progress.settings.showCoordinates,
    engineTimeMs: progress.settings.engineTimeMs,
  };

  return (
    <div>
      <div className="mt-6 flex mb-2 flex-wrap gap-1.5" aria-label={tl.pagesLabel(index + 1, lesson.pages.length)}>
        {lesson.pages.map((p, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              'size-3.5 rounded-full border-2 border-border bg-card disabled:cursor-default disabled:opacity-45',
              (done.has(i) || saved?.completed) && 'border-primary bg-primary mr-1.5',
              i === index && 'outline-2 outline-offset-2 outline-primary mr-1.5',
            )}
            onClick={() => go(i)}
            disabled={i > index && !(saved?.completed || [...Array(i).keys()].every((j) => done.has(j) || autoComplete(lesson.pages[j])))}
            aria-label={tl.pageDot(i + 1, tl.kind[p.kind])}
          />
        ))}
      </div>
      <Note className="mt-0 text-base font-medium">
        {index + 1}/{lesson.pages.length} · {tl.kind[page.kind]}
      </Note>

      {/* key: cada página empieza con su estado limpio */}
      <div key={index}>
        {page.kind === 'text' && <TextPageView page={page} {...common} />}
        {page.kind === 'quiz' && <QuizPageView page={page} {...common} />}
        {page.kind === 'move' && <MovePageView page={page} {...common} />}
        {page.kind === 'drill' && <DrillPageView page={page} {...common} />}
        {page.kind === 'play' && <PlayPageView page={page} {...common} />}
      </div>
      {/* Final de la página: al verlo en la última página de texto se abre la ventana de lección completada. */}
      <div ref={endRef} aria-hidden />
      {finishOpen && (
        <ResultDialog
          tone="correct"
          title={tl.completed}
          primary={{ label: nextLabel, onClick: goNextLesson }}
          secondary={{ label: tr.common.close, onClick: closeFinish }}
          onDismiss={closeFinish}
        >
          {tl.finishedLesson(lesson.title)}
        </ResultDialog>
      )}

      {/* Móvil: fija abajo, sobre la barra de pestañas, con un degradado para no cortar el contenido en seco.
          En dos columnas va dentro del panel (ver `nav`), para no tapar la parte baja del tablero. */}
      <div className="sticky bottom-(--tabbar-h) z-10 mt-4 flex flex-wrap items-center gap-2 bg-background py-2.5 trainer:hidden">
        {navButtons}
      </div>
    </div>
  );
}

/** «Siguiente lección» y, debajo, su título (como mucho dos líneas, para títulos largos). */
function NextLessonLabel({ title }: { title: string }) {
  const tl = useT().lesson;
  return (
    <span className="grid min-w-0 text-center leading-tight">
      <span>{tl.nextLesson}</span>
      <span className="line-clamp-2 text-xs font-normal opacity-85">{title}</span>
    </span>
  );
}
