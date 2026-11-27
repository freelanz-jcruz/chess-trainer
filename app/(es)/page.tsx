import Page, { homeMetadata } from '@/components/pages/HomePage';

export const metadata = homeMetadata('es');

export default function Route() {
  return <Page locale="es" />;
}
