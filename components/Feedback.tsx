'use client';
import type * as React from 'react';
import Callout, { TONE_TEXT } from './Callout';
import { cn } from '@/lib/utils';
import type { Verdict } from '@/lib/engine/evaluate';
import { useLocale, useT } from '@/lib/i18n/react';

export type FeedbackState =
  | { kind: 'idle'; text?: string }
  | { kind: 'thinking' }
  | { kind: 'verdict'; verdict: Verdict; san: string; loss?: number | null; reason?: 'missesMate' | 'allowsMate'; text?: string }
  | { kind: 'done'; text: string };

const ICON: Record<Verdict, string> = {
  correct: '✓',
  good: '👍',
  inaccuracy: '!?',
  mistake: '?',
  blunder: '??',
};

/**
 * Margen al desplazar el mensaje a la vista (useRevealResult): en móvil lo tapan la barra fija de
 * la lección (Anterior/Siguiente) y la de pestañas, así que se deja ese hueco por debajo.
 */
const SCROLL_MARGIN = 'scroll-mb-[calc(var(--tabbar-h)+4.5rem)] trainer:scroll-mb-4';

/** Muestra la valoración de la última jugada. */
export default function Feedback({ state, ref }: { state: FeedbackState; ref?: React.Ref<HTMLDivElement> }) {
  const t = useT();
  // Sin texto no se dibuja nada: un recuadro vacío parece un fallo.
  if (state.kind === 'idle') return state.text ? <Callout ref={ref} className={SCROLL_MARGIN}>{state.text}</Callout> : null;
  if (state.kind === 'thinking') return <Callout ref={ref} className={cn('text-muted-foreground', SCROLL_MARGIN)}>{t.feedback.thinking}</Callout>;
  if (state.kind === 'done') return <Callout ref={ref} tone="correct" className={SCROLL_MARGIN}>{state.text}</Callout>;
  return (
    <Callout ref={ref} tone={state.verdict} role="status" className={SCROLL_MARGIN}>
      <span className={`mr-1.5 font-bold ${state.verdict === 'good' ? '' : TONE_TEXT[state.verdict]}`} aria-hidden>
        {ICON[state.verdict]}
      </span>
      <strong>{state.san}</strong> · {t.verdict[state.verdict]}
      {state.verdict !== 'correct' && <Detail loss={state.loss} reason={state.reason} />}
      {state.text && <div className="mt-1 text-[0.95rem]">{state.text}</div>}
    </Callout>
  );
}

function Detail({ loss, reason }: { loss?: number | null; reason?: 'missesMate' | 'allowsMate' }) {
  const t = useT();
  const locale = useLocale();
  if (reason === 'allowsMate') return <span className="text-muted-foreground"> · {t.feedback.allowsMate}</span>;
  if (reason === 'missesMate') return <span className="text-muted-foreground"> · {t.feedback.missesMate}</span>;
  if (loss === undefined || loss === null) return null;
  return (
    <span className="text-muted-foreground" title={t.feedback.lossTitle}>
      {' '}
      (−{loss.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })})
    </span>
  );
}
