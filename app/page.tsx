import Curriculum from '@/components/Curriculum';
import { ReviewBanner } from '@/components/ReviewLinks';
import WelcomeBanner from '@/components/WelcomeBanner';
import { curriculum, puzzleIdsByLesson } from '@/lib/content/load';
import { DEFAULT_LOCALE, getMessages } from '@/lib/i18n';

export default function Home() {
  const t = getMessages(DEFAULT_LOCALE).pages.home;
  return (
    <>
      <h1>{t.title}</h1>
      <p className="my-4 text-muted-foreground">{t.intro}</p>
      <WelcomeBanner />
      <ReviewBanner />
      <Curriculum curriculum={curriculum} puzzleIds={puzzleIdsByLesson()} />
    </>
  );
}
