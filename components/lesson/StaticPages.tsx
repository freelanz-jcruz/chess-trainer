'use client';
import { CircleCheck, CircleX, ListChecks, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Board from '../board/Board';
import Callout from '../Callout';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Panel, Statement, Trainer } from '../Trainer';
import { cn } from '@/lib/utils';
import RichText from './RichText';
import { movesFrom } from '@/lib/chess/game';
import { START_FEN } from '@/lib/chess/opening-line';
import type { QuizPage, TextPage } from '@/lib/content/schemas';
import type { PageProps } from './types';

type View = Pick<TextPage, 'fen' | 'orientation' | 'arrows' | 'highlight' | 'showMovesFrom'>;

/** Tablero de solo lectura con flechas y casillas resaltadas. */
export function StaticBoard({ view, coordinates }: { view: View; coordinates: boolean }) {
  const fen = view.fen === 'startpos' || !view.fen ? START_FEN : view.fen;
  const highlight = useMemo(
    () => [...(view.highlight ?? []), ...(view.showMovesFrom ? movesFrom(fen, view.showMovesFrom) : [])],
    [fen, view.highlight, view.showMovesFrom],
  );
  const arrows = useMemo(() => (view.arrows ?? []).map(([from, to]) => ({ from, to })), [view.arrows]);
  return (
    <Board fen={fen} orientation={view.orientation ?? 'white'} movable={null} arrows={arrows} highlight={highlight} coordinates={coordinates} />
  );
}

export function TextPageView({ page, coordinates, nav }: PageProps<TextPage>) {
  return (
    <Layout withBoard={!!page.fen}>
      {page.fen && <StaticBoard view={page} coordinates={coordinates} />}
      <Panel>
        <Statement className="prose">
          {page.title && <h2>{page.title}</h2>}
          <RichText text={page.body} />
        </Statement>
        {nav}
      </Panel>
    </Layout>
  );
}

export function QuizPageView({ page, onComplete, completed, coordinates, nav }: PageProps<QuizPage>) {
  const [chosen, setChosen] = useState<number | null>(completed ? page.answer : null);
  // En móvil (con tablero) las opciones están en un panel lateral y el resultado sale en una ventana
  // centrada en la pantalla; al cerrarla, el acierto queda en el texto.
  const [sheet, setSheet] = useState(false);
  const [popup, setPopup] = useState(false);
  const [pending, setPending] = useState(false); // ventana a la espera de que se cierre el panel
  const right = chosen === page.answer;
  const closePopup = useCallback(() => setPopup(false), []);
  const retry = useCallback(() => {
    setPopup(false);
    setSheet(true);
  }, []);
  // La ventana del resultado se abre cuando el panel ha terminado de cerrarse, para no solapar los dos.
  useEffect(() => {
    if (sheet || !pending) return;
    const t = setTimeout(() => {
      setPending(false);
      setPopup(true);
    }, 350);
    return () => clearTimeout(t);
  }, [sheet, pending]);
  const result = right ? (
    <>
      <strong>¡Correcto!</strong> {page.explain}
    </>
  ) : (
    'No es esa. Prueba otra vez.'
  );

  const pick = (i: number, fromSheet: boolean) => {
    setChosen(i);
    if (i === page.answer) onComplete();
    if (!page.fen) return;
    if (fromSheet) {
      setPending(true);
      setSheet(false);
    } else setPopup(true);
  };

  const options = (fromSheet: boolean) =>
    page.options.map((opt, i) => {
      const state = chosen === null ? '' : i === page.answer && right ? 'right' : i === chosen ? 'wrong' : '';
      return (
        <button
          key={i}
          type="button"
          className={cn(
            'min-h-10 rounded-md border border-border bg-card px-3.5 py-2 text-left transition-colors enabled:hover:bg-accent',
            state === 'right' && 'border-ok bg-[color-mix(in_srgb,var(--ok)_15%,var(--card))] enabled:hover:bg-[color-mix(in_srgb,var(--ok)_15%,var(--card))]',
            state === 'wrong' && 'border-mistake bg-[color-mix(in_srgb,var(--mistake)_12%,var(--card))]',
          )}
          disabled={right}
          onClick={() => pick(i, fromSheet)}
        >
          {opt}
        </button>
      );
    });

  return (
    <Layout withBoard={!!page.fen}>
      {page.fen && <StaticBoard view={page} coordinates={coordinates} />}
      {popup && chosen !== null && (
        <ResultPopup right={right} explain={right ? page.explain : undefined} onClose={right ? closePopup : retry} />
      )}
      <Panel>
        <Statement className="prose">
          <RichText text={page.body} />
        </Statement>
        {/* Sin tablero, o en dos columnas, las opciones van a la vista. */}
        <Statement className={cn('grid gap-2', page.fen && 'hidden trainer:grid')}>{options(false)}</Statement>
        {page.fen && (
          // En móvil, tras un botón que abre un panel lateral: el tablero queda justo debajo del enunciado.
          <Statement className="trainer:hidden">
            <Drawer
              direction="right"
              open={sheet}
              onOpenChange={setSheet}
            >
              <Button variant={right ? 'outline' : 'default'} className="w-full" onClick={() => setSheet(true)}>
                <ListChecks /> {right ? 'Ver las respuestas' : 'Ver respuestas'}
              </Button>
              <DrawerContent side="right" overlayClassName="bg-black/30">
                <DrawerHeader className="flex-row items-start justify-between gap-2 pt-4">
                  <div className="grid gap-1">
                    <DrawerTitle>Respuestas</DrawerTitle>
                    <DrawerDescription asChild>
                      <div className="prose text-sm">
                        <RichText text={page.body} />
                      </div>
                    </DrawerDescription>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="-mt-1 -mr-2 shrink-0" aria-label="Cerrar">
                      <X />
                    </Button>
                  </DrawerClose>
                </DrawerHeader>
                <div className="grid content-start gap-2 overflow-y-auto px-4 pt-1 pb-6">{options(true)}</div>
              </DrawerContent>
            </Drawer>
          </Statement>
        )}
        {chosen !== null && (
          // En móvil, mientras está abierta la ventana, y tras cerrar un fallo, no se repite aquí.
          <Statement className={cn((popup || pending || !right) && page.fen && 'hidden trainer:block')}>
            <Callout tone={right ? 'correct' : 'mistake'} role="status">
              {result}
            </Callout>
          </Statement>
        )}
        {nav}
      </Panel>
    </Layout>
  );
}

/**
 * Resultado de una pregunta en una ventana modal centrada en la pantalla, para verlo sin buscarlo.
 * Solo en móvil: en dos columnas el resultado ya está a la vista en el panel.
 */
function ResultPopup({ right, explain, onClose }: { right: boolean; explain?: string; onClose: () => void }) {
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (window.matchMedia('(min-width: 51.25rem)').matches) return;
    button.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    // Sin desplazar la página mientras está abierta.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
  const Icon = right ? CircleCheck : CircleX;
  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-[max(1rem,env(safe-area-inset-left))] backdrop-blur-sm animate-in fade-in trainer:hidden"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="quiz-result-title"
        className={cn(
          'grid max-h-[85dvh] w-full max-w-sm gap-4 overflow-y-auto rounded-xl border border-t-4 border-border bg-card p-5 text-card-foreground shadow-2xl dark:bg-secondary animate-in zoom-in-95',
          right ? 'border-t-ok' : 'border-t-mistake',
        )}
      >
        <h2 id="quiz-result-title" className="m-0 flex items-center gap-2 text-lg">
          <Icon aria-hidden className={right ? 'text-ok' : 'text-mistake'} />
          {right ? '¡Correcto!' : 'No es esa'}
        </h2>
        {explain && <p className="m-0">{explain}</p>}
        <Button ref={button} className="w-full" onClick={onClose}>
          {right ? 'Entendido' : 'Probar otra vez'}
        </Button>
      </div>
    </div>,
    document.body,
  );
}

/** Con tablero: rejilla de entrenador; sin tablero: solo el texto, con ancho de lectura. */
function Layout({ withBoard, children }: { withBoard: boolean; children: React.ReactNode }) {
  return withBoard ? <Trainer>{children}</Trainer> : <div className="mt-3 grid max-w-[680px] gap-3">{children}</div>;
}
