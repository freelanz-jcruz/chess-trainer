import Link from 'next/link';
import { Note } from '@/components/Trainer';
import { notFound } from 'next/navigation';
import OpeningPractice from '@/components/OpeningPractice';
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
  return { title: t.meta.pageTitle(t.pages.opening.practiceTitle(getOpening(id)?.name ?? t.pages.opening.fallback)) };
}

export default async function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opening = getOpening(id);
  if (!opening) notFound();
  return (
    <>
      <h1>{t.pages.opening.practiceTitle(opening.name)}</h1>
      <Note className="my-3.5">
        <Fill
          text={t.pages.opening.practiceNote(opening.side === 'white')}
          values={{ walkthrough: <Link href={`/aperturas/${opening.id}/`}>{t.pages.opening.walkthroughLink}</Link> }}
        />
      </Note>
      <OpeningPractice opening={opening} />
    </>
  );
}
