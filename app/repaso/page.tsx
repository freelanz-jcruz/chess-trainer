import ReviewPage from '@/components/ReviewPage';
import { openings, puzzles } from '@/lib/content/load';

export const metadata = { title: 'Repaso · Chess Trainer' };

export default function Repaso() {
  return (
    <>
      <h1>Repaso</h1>
      <ReviewPage openings={openings.map((o) => ({ id: o.id, name: o.name, side: o.side }))} puzzles={puzzles} />
    </>
  );
}
