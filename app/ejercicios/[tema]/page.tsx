import Link from 'next/link';
import { notFound } from 'next/navigation';
import { chipClass } from '@/components/Chip';
import PuzzleTrainer from '@/components/PuzzleTrainer';
import { puzzleSets, puzzlesForSet } from '@/lib/content/load';

export const dynamicParams = false;
export function generateStaticParams() {
  return puzzleSets.map((s) => ({ tema: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ tema: string }> }) {
  const { tema } = await params;
  return { title: `Ejercicios: ${puzzleSets.find((s) => s.id === tema)?.title ?? ''} · Chess Trainer` };
}

export default async function PuzzlesPage({ params }: { params: Promise<{ tema: string }> }) {
  const { tema } = await params;
  const set = puzzleSets.find((s) => s.id === tema);
  if (!set) notFound();
  return (
    <>
      <h1>Ejercicios</h1>
      <nav className="my-2 flex flex-wrap gap-1.5" aria-label="Temas">
        {puzzleSets.map((s) => (
          <Link key={s.id} href={`/ejercicios/${s.id}/`} className={chipClass(s.id === tema)}>
            {s.title}
          </Link>
        ))}
      </nav>
      <PuzzleTrainer puzzles={puzzlesForSet(set)} title={set.title} />
    </>
  );
}
