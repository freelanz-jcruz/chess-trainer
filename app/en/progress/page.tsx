import Page, { progressMetadata } from '@/components/pages/ProgressPage';

export const metadata = progressMetadata('en');

export default function Route() {
  return <Page locale="en" />;
}
