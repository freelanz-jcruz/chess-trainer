'use client';
import { CircleCheck, CircleX } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Mismo punto que la variante `trainer:` (tablero y panel en dos columnas). */
const TWO_COLUMNS = '(min-width: 51.25rem)';

type Action = { label: string; onClick: () => void };

/**
 * Resultado de un ejercicio o una pregunta en una ventana modal centrada en la pantalla, para verlo sin
 * buscarlo bajo el tablero. Solo en móvil: en dos columnas el mensaje ya está a la vista en el panel
 * (ver `useRevealResult`).
 */
export default function ResultDialog({
  tone,
  title,
  children,
  primary,
  secondary,
  onDismiss,
}: {
  tone: 'correct' | 'mistake';
  title: string;
  children?: React.ReactNode;
  primary: Action;
  secondary?: Action;
  /** Al tocar fuera o pulsar Esc. */
  onDismiss: () => void;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (window.matchMedia(TWO_COLUMNS).matches) return;
    button.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDismiss();
    window.addEventListener('keydown', onKey);
    // Sin desplazar la página mientras está abierta.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onDismiss]);
  const right = tone === 'correct';
  const Icon = right ? CircleCheck : CircleX;
  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-[max(1rem,env(safe-area-inset-left))] backdrop-blur-sm animate-in fade-in trainer:hidden"
      onClick={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'grid max-h-[85dvh] w-full max-w-sm gap-4 overflow-y-auto rounded-xl border border-t-4 border-border bg-card p-5 text-card-foreground shadow-2xl dark:bg-secondary animate-in zoom-in-95',
          right ? 'border-t-ok' : 'border-t-mistake',
        )}
      >
        <h2 id={titleId} className="m-0 flex items-center gap-2 text-lg">
          <Icon aria-hidden className={right ? 'text-ok' : 'text-mistake'} />
          {title}
        </h2>
        {children && <div className="m-0">{children}</div>}
        <div className="grid gap-2">
          <Button ref={button} className="w-full" onClick={primary.onClick}>
            {primary.label}
          </Button>
          {secondary && (
            <Button variant="outline" className="w-full bg-transparent" onClick={secondary.onClick}>
              {secondary.label}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Desplaza la página lo justo para que el mensaje del resultado (`ref`) quede a la vista: en dos columnas,
 * en cuanto termina el ejercicio; en móvil, al cerrar la ventana de resultado (antes la tapa la ventana).
 */
export function useRevealResult(ref: React.RefObject<HTMLElement | null>, finished: boolean, dialogOpen: boolean) {
  useEffect(() => {
    if (!finished) return;
    if (!window.matchMedia(TWO_COLUMNS).matches && dialogOpen) return;
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [ref, finished, dialogOpen]);
}
