import Link from 'next/link';
import { Note } from '@/components/Trainer';
import { notFound } from 'next/navigation';
import OpeningWalkthrough from '@/components/OpeningWalkthrough';
import { getOpening, openings } from '@/lib/content/load';
import { Fill } from '@/lib/i18n/bold';
import { DEFAULT_LOCALE, getMessages } from '@/lib/i18n';

const t = getMessages(DEFAULT_LOCALE);

export const dynamicParams = false;
export function generateStaticParams() {
  return openings.map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: t.meta.pageTitle(getOpening(id)?.name ?? t.pages.opening.fallback) };
}

export default async function OpeningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opening = getOpening(id);
  if (!opening) notFound();
  return (
    <>
      <h1>{opening.name}</h1>
      <Note className="my-3.5">
        <Fill
          text={t.pages.opening.note(
            opening.kind === 'trap',
            opening.side === 'white',
            opening.eco,
            opening.steps.some((s) => s.branches?.length),
          )}
          values={{ practice: <Link href={`/aperturas/${opening.id}/practica/`}>{t.pages.opening.practiceLink}</Link> }}
        />
      </Note>
      <OpeningWalkthrough opening={opening} />
    </>
  );
}
