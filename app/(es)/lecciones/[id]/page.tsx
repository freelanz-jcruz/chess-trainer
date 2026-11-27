import Page, { lessonMetadata, lessonParams } from '@/components/pages/LessonPage';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = lessonParams;
export const generateMetadata = (props: Props) => lessonMetadata('es', props);

export default function Route(props: Props) {
  return <Page locale="es" {...props} />;
}
