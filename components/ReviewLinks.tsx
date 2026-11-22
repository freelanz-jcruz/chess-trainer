'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useDueCount } from './ReviewPage';

/** Aviso en el temario cuando hay repasos pendientes hoy. */
export function ReviewBanner() {
  const due = useDueCount();
  if (!due) return null;
  return (
    <p className="my-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-primary px-3.5 py-2.5">
      Hoy tienes {due} repaso{due === 1 ? '' : 's'} pendiente{due === 1 ? '' : 's'}.{' '}
      <Button asChild>
        <Link href="/repaso/">Repasar</Link>
      </Button>
    </p>
  );
}
