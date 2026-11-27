import Page, { homeMetadata } from '@/components/pages/HomePage';

export const metadata = homeMetadata('en');

export default function Route() {
  return <Page locale="en" />;
}
