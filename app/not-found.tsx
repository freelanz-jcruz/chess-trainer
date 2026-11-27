import Link from 'next/link';
import { DEFAULT_LOCALE, getMessages } from '@/lib/i18n';

export default function NotFound() {
  const t = getMessages(DEFAULT_LOCALE);
  return (
    <>
      <h1>{t.pages.notFound.title}</h1>
      <p className="my-4">
        <Link href="/">{t.lesson.backToCurriculum}</Link>
      </p>
    </>
  );
}
