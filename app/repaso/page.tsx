import ReviewPage from '@/components/ReviewPage';
import { openings, puzzles } from '@/lib/content/load';
import { DEFAULT_LOCALE, getMessages } from '@/lib/i18n';

const t = getMessages(DEFAULT_LOCALE);

export const metadata = { title: t.meta.pageTitle(t.pages.review.title) };

export default function Repaso() {
  return (
    <>
      <h1>{t.pages.review.title}</h1>
      <ReviewPage openings={openings.map((o) => ({ id: o.id, name: o.name, side: o.side }))} puzzles={puzzles} />
    </>
  );
}
