'use client';
import Link from 'next/link';
import { useDueCount } from './ReviewPage';

/** Enlace «Repaso» de la cabecera, con el número de repasos pendientes hoy. */
export function NavReviewLink() {
  const due = useDueCount();
  return (
    <Link href="/repaso/">
      Repaso
      {!!due && (
        <span className="badge" aria-label={`${due} pendientes`}>
          {due}
        </span>
      )}
    </Link>
  );
}

/** Aviso en el temario cuando hay repasos pendientes hoy. */
export function ReviewBanner() {
  const due = useDueCount();
  if (!due) return null;
  return (
    <p className="review-banner">
      Hoy tienes {due} repaso{due === 1 ? '' : 's'} pendiente{due === 1 ? '' : 's'}.{' '}
      <Link className="button primary" href="/repaso/">
        Repasar
      </Link>
    </p>
  );
}
