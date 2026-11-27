import Link from 'next/link';
import { notFound } from 'next/navigation';
import OpeningPractice from '@/components/OpeningPractice';
import { Note } from '@/components/Trainer';
import { getOpening, openingIn, openings } from '@/lib/content/load';
import { getMessages, type Locale } from '@/lib/i18n';
import { Fill } from '@/lib/i18n/bold';
import { routeHref } from '@/lib/i18n/routes';
import { pageMetadata } from '@/lib/site';

type Params = { params: Promise<{ id: string }> };

export const practiceParams = () => openings.map((o) => ({ id: o.id }));

export async function practiceMetadata(locale: Locale, { params }: Params) {
  const { id } = await params;
  const opening = getOpening(id);
  const t = getMessages(locale).pages.opening;
  return pageMetadata(locale, { name: 'practice', id }, { title: t.practiceTitle(opening ? openingIn(opening, locale).name : t.fallback) });
}

export default async function PracticePage({ locale, params }: Params & { locale: Locale }) {
  const { id } = await params;
  const found = getOpening(id);
  if (!found) notFound();
  const opening = openingIn(found, locale);
  const t = getMessages(locale).pages.opening;
  return (
    <>
      <h1>{t.practiceTitle(opening.name)}</h1>
      <Note className="my-3.5">
        <Fill
          text={t.practiceNote(opening.side === 'white')}
          values={{ walkthrough: <Link href={routeHref(locale, { name: 'opening', id })}>{t.walkthroughLink}</Link> }}
        />
      </Note>
      <OpeningPractice opening={opening} />
    </>
  );
}
