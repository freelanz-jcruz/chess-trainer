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
  if (state.kind === 'idle') return <div className="feedback">{state.text ?? ' '}</div>;
  if (state.kind === 'thinking') return <div className="feedback muted">Analizando…</div>;
  if (state.kind === 'done') return <div className="feedback verdict-correct">{state.text}</div>;
  return (
    <div className={`feedback verdict-${state.verdict}`} role="status">
      <span className="verdict-icon" aria-hidden>
        {ICON[state.verdict]}
      </span>
      <strong>{state.san}</strong> · {VERDICT_LABEL[state.verdict]}
      {state.verdict !== 'correct' && <Detail loss={state.loss} reason={state.reason} />}
      {state.text && <div className="feedback-text">{state.text}</div>}
    </div>
  );
}

function Detail({ loss, reason }: { loss?: number | null; reason?: 'missesMate' | 'allowsMate' }) {
  if (reason === 'allowsMate') return <span className="muted"> · permite mate</span>;
  if (reason === 'missesMate') return <span className="muted"> · deja escapar el mate</span>;
  if (loss === undefined || loss === null) return null;
  return (
    <span className="muted" title="Peones perdidos respecto a la mejor jugada">
      {' '}
      (−{loss.toLocaleString('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 })})
    </span>
  );
}
