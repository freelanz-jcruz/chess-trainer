import { notFound } from 'next/navigation';
import PuzzleSetNav from '@/components/PuzzleSetNav';
import PuzzleTrainer from '@/components/PuzzleTrainer';
import { puzzleSets, puzzlesForSet } from '@/lib/content/load';

export const dynamicParams = false;
export function generateStaticParams() {
  return puzzleSets.map((s) => ({ tema: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ tema: string }> }) {
  const { tema } = await params;
  return { title: `Ejercicios: ${puzzleSets.find((s) => s.id === tema)?.title ?? ''} · Ajedrez Tutor` };
}

export default async function PuzzlesPage({ params }: { params: Promise<{ tema: string }> }) {
  const { tema } = await params;
  const set = puzzleSets.find((s) => s.id === tema);
  if (!set) notFound();
  return (
    <>
      <h1 className="mb-5">Ejercicios</h1>
      <PuzzleSetNav sets={puzzleSets.map(({ id, title, level }) => ({ id, title, level }))} current={tema} />
      {/* «Todos» (sin nivel) se limita al nivel elegido; un tema concreto muestra siempre los suyos. */}
      <PuzzleTrainer puzzles={puzzlesForSet(set)} title={set.title} limitToLevel={!set.level} />
    </>
  );
}
