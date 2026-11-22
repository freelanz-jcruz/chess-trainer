import Link from 'next/link';
import { Note } from '@/components/Trainer';
import { notFound } from 'next/navigation';
import OpeningPractice from '@/components/OpeningPractice';
import { getOpening, openings } from '@/lib/content/load';

export const dynamicParams = false;
export function generateStaticParams() {
  return openings.map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Práctica: ${getOpening(id)?.name ?? 'Apertura'} · Chess Trainer` };
}

export default async function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opening = getOpening(id);
  if (!opening) notFound();
  return (
    <>
      <h1>Práctica: {opening.name}</h1>
      <Note className="my-3.5">
        Juega tú las jugadas de las {opening.side === 'white' ? 'blancas' : 'negras'}; Stockfish valora cada una ·{' '}
        <Link href={`/aperturas/${opening.id}/`}>Ver el recorrido</Link>
      </Note>
      <OpeningPractice opening={opening} />
    </>
  );
}
