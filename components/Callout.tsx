import type * as React from 'react';
import type { Verdict } from '@/lib/engine/evaluate';
import { cn } from '@/lib/utils';

export type Tone = 'neutral' | Verdict;

/** Borde izquierdo de color según el resultado (valoración de jugada, acierto o fallo). */
const TONE: Record<Tone, string> = {
  neutral: 'border-l-border',
  correct: 'border-l-ok',
  good: 'border-l-good',
  inaccuracy: 'border-l-inacc',
  mistake: 'border-l-mistake',
  blunder: 'border-l-blunder',
};

/** Recuadro de texto junto al tablero: nota de la jugada, valoración o resultado. */
export default function Callout({ tone = 'neutral', className, ...props }: React.ComponentProps<'div'> & { tone?: Tone }) {
  return (
    <div
      className={cn(
        'min-h-[3.2em] rounded-lg border border-l-[5px] border-border bg-card px-3 py-2.5 tabular-nums',
        TONE[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Color de texto para el icono de cada valoración. */
export const TONE_TEXT: Record<Verdict, string> = {
  correct: 'text-ok',
  good: 'text-good',
  inaccuracy: 'text-inacc',
  mistake: 'text-mistake',
  blunder: 'text-blunder',
};
