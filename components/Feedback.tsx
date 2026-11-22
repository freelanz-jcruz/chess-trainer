import Callout, { TONE_TEXT } from './Callout';
import { VERDICT_LABEL, type Verdict } from '@/lib/engine/evaluate';

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

/** Muestra la valoración de la última jugada. */
export default function Feedback({ state }: { state: FeedbackState }) {
  if (state.kind === 'idle') return <Callout>{state.text ?? ' '}</Callout>;
  if (state.kind === 'thinking') return <Callout className="text-muted-foreground">Analizando…</Callout>;
  if (state.kind === 'done') return <Callout tone="correct">{state.text}</Callout>;
  return (
    <Callout tone={state.verdict} role="status">
      <span className={`mr-1.5 font-bold ${state.verdict === 'good' ? '' : TONE_TEXT[state.verdict]}`} aria-hidden>
        {ICON[state.verdict]}
      </span>
      <strong>{state.san}</strong> · {VERDICT_LABEL[state.verdict]}
      {state.verdict !== 'correct' && <Detail loss={state.loss} reason={state.reason} />}
      {state.text && <div className="mt-1 text-[0.95rem]">{state.text}</div>}
    </Callout>
  );
}

function Detail({ loss, reason }: { loss?: number | null; reason?: 'missesMate' | 'allowsMate' }) {
  if (reason === 'allowsMate') return <span className="text-muted-foreground"> · permite mate</span>;
  if (reason === 'missesMate') return <span className="text-muted-foreground"> · deja escapar el mate</span>;
  if (loss === undefined || loss === null) return null;
  return (
    <span className="text-muted-foreground" title="Peones perdidos respecto a la mejor jugada">
      {' '}
      (−{loss.toLocaleString('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 })})
    </span>
  );
}
