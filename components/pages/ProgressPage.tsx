import ProgressTools from '@/components/ProgressTools';
import { getMessages, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/site';

export function progressMetadata(locale: Locale) {
  return pageMetadata(locale, { name: 'progress' }, { title: getMessages(locale).pages.progress.metaTitle });
}

export default function ProgressPage({ locale }: { locale: Locale }) {
  return (
    <>
      <h1>{getMessages(locale).pages.progress.title}</h1>
      <ProgressTools />
    </>
  );
}
