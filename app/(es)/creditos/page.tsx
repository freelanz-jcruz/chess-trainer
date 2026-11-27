import Page, { creditsMetadata } from '@/components/pages/CreditsPage';

export const metadata = creditsMetadata('es');

export default function Route() {
  return <Page locale="es" />;
}
