import Page, { practiceMetadata, practiceParams } from '@/components/pages/PracticePage';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = practiceParams;
export const generateMetadata = (props: Props) => practiceMetadata('es', props);

export default function Route(props: Props) {
  return <Page locale="es" {...props} />;
}
