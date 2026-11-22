import { notFound } from 'next/navigation';
import LessonPlayer from '@/components/lesson/LessonPlayer';
import { getLesson, lessons, nextLessonAfter } from '@/lib/content/load';

export const dynamicParams = false;
export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${getLesson(id)?.title ?? 'Lección'} · Chess Trainer` };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  return (
    <>
      <h1>{lesson.title}</h1>
      <p className="muted small">
        Bloque {lesson.block} · {lesson.summary}
      </p>
      <LessonPlayer lesson={lesson} next={nextLessonAfter(lesson.id)} />
    </>
  );
}
