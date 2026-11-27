'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useHref, useT } from '@/lib/i18n/react';
import { useDueCount } from './ReviewPage';

/** Aviso en el temario cuando hay repasos pendientes hoy. */
export function ReviewBanner() {
  const due = useDueCount();
  const tr = useT().review;
  const href = useHref();
  if (!due) return null;
  return (
    <p className="my-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-primary px-3.5 py-2.5">
      {tr.banner(due)}{' '}
      <Button asChild>
        <Link href={href({ name: 'review' })}>{tr.bannerButton}</Link>
      </Button>
    </p>
  );
}
