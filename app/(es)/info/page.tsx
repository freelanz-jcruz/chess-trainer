import Page, { infoMetadata } from '@/components/pages/InfoPage';

export const metadata = infoMetadata('es');

export default function Route() {
  return <Page locale="es" />;
}
