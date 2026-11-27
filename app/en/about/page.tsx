import Page, { infoMetadata } from '@/components/pages/InfoPage';

export const metadata = infoMetadata('en');

export default function Route() {
  return <Page locale="en" />;
}
