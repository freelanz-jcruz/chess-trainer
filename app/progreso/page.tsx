import ProgressTools from '@/components/ProgressTools';
import { DEFAULT_LOCALE, getMessages } from '@/lib/i18n';

const t = getMessages(DEFAULT_LOCALE);

export const metadata = { title: t.meta.pageTitle(t.pages.progress.metaTitle) };

export default function Progreso() {
  return (
    <>
      <h1>{t.pages.progress.title}</h1>
      <ProgressTools />
    </>
  );
}
