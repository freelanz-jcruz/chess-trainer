import Curriculum from '@/components/Curriculum';
import { curriculum, puzzleIdsByLesson } from '@/lib/content/load';

export default function Home() {
  return (
    <>
      <h1>Temario</h1>
      <p className="muted">
        Aprende a tu ritmo. Cada bloque se irá completando poco a poco; los marcados como «próximamente» aún no están
        disponibles.
      </p>
      <Curriculum curriculum={curriculum} puzzleIds={puzzleIdsByLesson()} />
    </>
  );
}
