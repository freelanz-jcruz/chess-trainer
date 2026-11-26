import Curriculum from '@/components/Curriculum';
import { ReviewBanner } from '@/components/ReviewLinks';
import WelcomeBanner from '@/components/WelcomeBanner';
import { curriculum, puzzleIdsByLesson } from '@/lib/content/load';

export default function Home() {
  return (
    <>
      <h1>Temario</h1>
      <p className="my-4 text-muted-foreground">Aprende a tu ritmo: sigue los bloques en orden o salta a lo que te interese.</p>
      <WelcomeBanner />
      <ReviewBanner />
      <Curriculum curriculum={curriculum} puzzleIds={puzzleIdsByLesson()} />
    </>
  );
}
