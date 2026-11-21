import Link from 'next/link';
import { notFound } from 'next/navigation';
import OpeningWalkthrough from '@/components/OpeningWalkthrough';
import { getOpening, openings } from '@/lib/content/load';

export const dynamicParams = false;
export function generateStaticParams() {
  return openings.map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${getOpening(id)?.name ?? 'Apertura'} · Chess Trainer` };
}

export default async function OpeningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opening = getOpening(id);
  if (!opening) notFound();
  return (
    <>
      <h1>{opening.name}</h1>
      <p className="muted small">
        Recorrido paso a paso · juegas con {opening.side === 'white' ? 'blancas' : 'negras'} ·{' '}
        <Link href={`/aperturas/${opening.id}/practica/`}>Ir a la práctica</Link>
      </p>
      <OpeningWalkthrough opening={opening} />
    </>
  );
}
