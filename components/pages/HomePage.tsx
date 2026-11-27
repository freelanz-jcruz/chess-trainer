import Curriculum from '@/components/Curriculum';
import { ReviewBanner } from '@/components/ReviewLinks';
import WelcomeBanner from '@/components/WelcomeBanner';
import { curriculumIn, puzzleIdsByLesson } from '@/lib/content/load';
import { getMessages, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/site';

export function homeMetadata(locale: Locale) {
  const t = getMessages(locale);
  return pageMetadata(locale, { name: 'home' }, { title: t.appName, fullTitle: true });
}

export default function HomePage({ locale }: { locale: Locale }) {
  const t = getMessages(locale).pages.home;
  return (
    <>
      <h1>{t.title}</h1>
      <p className="my-4 text-muted-foreground">{t.intro}</p>
      <WelcomeBanner />
      <ReviewBanner />
      <Curriculum curriculum={curriculumIn(locale)} puzzleIds={puzzleIdsByLesson()} />
    </>
  );
}
