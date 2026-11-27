import Page, { openingMetadata, openingParams } from '@/components/pages/OpeningPage';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = openingParams;
export const generateMetadata = (props: Props) => openingMetadata('es', props);

export default function Route(props: Props) {
  return <Page locale="es" {...props} />;
}
