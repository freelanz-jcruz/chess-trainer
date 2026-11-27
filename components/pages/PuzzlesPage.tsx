import { notFound } from 'next/navigation';
import PuzzleSetNav from '@/components/PuzzleSetNav';
import PuzzleTrainer from '@/components/PuzzleTrainer';
import { puzzleSets, puzzleSetsIn, puzzlesForSet } from '@/lib/content/load';
import { getMessages, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/site';

type Params = { params: Promise<{ tema: string }> };

export const puzzlesParams = () => puzzleSets.map((s) => ({ tema: s.id }));

export async function puzzlesMetadata(locale: Locale, { params }: Params) {
  const { tema } = await params;
  const t = getMessages(locale);
  const set = puzzleSetsIn(locale).find((s) => s.id === tema);
  return pageMetadata(locale, { name: 'puzzles', id: tema }, { title: t.pages.puzzles.metaTitle(set?.title ?? '') });
}

export default async function PuzzlesPage({ locale, params }: Params & { locale: Locale }) {
  const { tema } = await params;
  const sets = puzzleSetsIn(locale);
  const set = sets.find((s) => s.id === tema);
  if (!set) notFound();
  return (
    <>
      <h1 className="mb-5">{getMessages(locale).pages.puzzles.title}</h1>
      <PuzzleSetNav sets={sets.map(({ id, title, level }) => ({ id, title, level }))} current={tema} />
      {/* «Todos» (sin nivel) se limita al nivel elegido; un tema concreto muestra siempre los suyos. */}
      <PuzzleTrainer puzzles={puzzlesForSet(set)} title={set.title} limitToLevel={!set.level} />
    </>
  );
}
