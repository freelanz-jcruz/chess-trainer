import { notFound } from 'next/navigation';
import { Note } from '@/components/Trainer';
import LessonPlayer from '@/components/lesson/LessonPlayer';
import { getLesson, lessons, nextLessonAfter } from '@/lib/content/load';
import { DEFAULT_LOCALE, getMessages } from '@/lib/i18n';

const t = getMessages(DEFAULT_LOCALE);

export const dynamicParams = false;
export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: t.meta.pageTitle(getLesson(id)?.title ?? t.pages.lesson.fallback) };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  return (
    <>
      <h1>{lesson.title}</h1>
      <Note className="mb-3">
        {t.pages.lesson.block(lesson.block, lesson.summary)}
      </Note>
      <LessonPlayer lesson={lesson} next={nextLessonAfter(lesson.id)} />
    </>
  );
}
