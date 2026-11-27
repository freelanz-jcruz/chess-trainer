import Link from 'next/link';
import { notFound } from 'next/navigation';
import OpeningWalkthrough from '@/components/OpeningWalkthrough';
import { Note } from '@/components/Trainer';
import { getOpening, openingIn, openings } from '@/lib/content/load';
import { getMessages, type Locale } from '@/lib/i18n';
import { Fill } from '@/lib/i18n/bold';
import { routeHref } from '@/lib/i18n/routes';
import { pageMetadata } from '@/lib/site';

type Params = { params: Promise<{ id: string }> };

export const openingParams = () => openings.map((o) => ({ id: o.id }));

export async function openingMetadata(locale: Locale, { params }: Params) {
  const { id } = await params;
  const opening = getOpening(id);
  const t = getMessages(locale);
  return pageMetadata(locale, { name: 'opening', id }, { title: opening ? openingIn(opening, locale).name : t.pages.opening.fallback });
}

export default async function OpeningPage({ locale, params }: Params & { locale: Locale }) {
  const { id } = await params;
  const found = getOpening(id);
  if (!found) notFound();
  const opening = openingIn(found, locale);
  const t = getMessages(locale);
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
          values={{ practice: <Link href={routeHref(locale, { name: 'practice', id })}>{t.pages.opening.practiceLink}</Link> }}
        />
      </Note>
      <OpeningWalkthrough opening={opening} />
    </>
  );
}
