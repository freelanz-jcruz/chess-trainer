import ReviewPage from '@/components/ReviewPage';
import { openingIn, openings, puzzles } from '@/lib/content/load';
import { getMessages, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/site';

export function reviewMetadata(locale: Locale) {
  return pageMetadata(locale, { name: 'review' }, { title: getMessages(locale).pages.review.title });
}

export default function ReviewRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <h1>{getMessages(locale).pages.review.title}</h1>
      <ReviewPage
        openings={openings.map((o) => ({ id: o.id, name: openingIn(o, locale).name, side: o.side }))}
        puzzles={puzzles}
      />
    </>
  );
}
