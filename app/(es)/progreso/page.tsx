import Page, { progressMetadata } from '@/components/pages/ProgressPage';

export const metadata = progressMetadata('es');

export default function Route() {
  return <Page locale="es" />;
}
