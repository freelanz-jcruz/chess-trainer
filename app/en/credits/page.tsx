import Page, { creditsMetadata } from '@/components/pages/CreditsPage';

export const metadata = creditsMetadata('en');

export default function Route() {
  return <Page locale="en" />;
}
