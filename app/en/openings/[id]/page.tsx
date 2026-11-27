import Page, { openingMetadata, openingParams } from '@/components/pages/OpeningPage';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = openingParams;
export const generateMetadata = (props: Props) => openingMetadata('en', props);

export default function Route(props: Props) {
  return <Page locale="en" {...props} />;
}
