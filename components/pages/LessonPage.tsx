import { notFound } from 'next/navigation';
import { Note } from '@/components/Trainer';
import LessonPlayer from '@/components/lesson/LessonPlayer';
import { getLesson, lessonIn, lessons, nextLessonAfter } from '@/lib/content/load';
import { getMessages, type Locale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/site';

type Params = { params: Promise<{ id: string }> };

export const lessonParams = () => lessons.map((l) => ({ id: l.id }));

export async function lessonMetadata(locale: Locale, { params }: Params) {
  const { id } = await params;
  const lesson = getLesson(id);
  const t = getMessages(locale);
  return pageMetadata(locale, { name: 'lesson', id }, { title: lesson ? lessonIn(lesson, locale).title : t.pages.lesson.fallback });
}

export default async function LessonPage({ locale, params }: Params & { locale: Locale }) {
  const { id } = await params;
  const found = getLesson(id);
  if (!found) notFound();
  const lesson = lessonIn(found, locale);
  const t = getMessages(locale);
  return (
    <>
      <h1>{lesson.title}</h1>
      <Note className="mb-3">{t.pages.lesson.block(lesson.block, lesson.summary)}</Note>
      <LessonPlayer lesson={lesson} next={nextLessonAfter(lesson.id, locale)} />
    </>
  );
}
