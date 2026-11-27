import Page, { puzzlesMetadata, puzzlesParams } from '@/components/pages/PuzzlesPage';

type Props = { params: Promise<{ tema: string }> };

export const dynamicParams = false;
export const generateStaticParams = puzzlesParams;
export const generateMetadata = (props: Props) => puzzlesMetadata('es', props);

export default function Route(props: Props) {
  return <Page locale="es" {...props} />;
}
