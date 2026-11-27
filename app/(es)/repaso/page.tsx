import Page, { reviewMetadata } from '@/components/pages/ReviewPage';

export const metadata = reviewMetadata('es');

export default function Route() {
  return <Page locale="es" />;
}
