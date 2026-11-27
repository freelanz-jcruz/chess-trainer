import Page, { reviewMetadata } from '@/components/pages/ReviewPage';

export const metadata = reviewMetadata('en');

export default function Route() {
  return <Page locale="en" />;
}
