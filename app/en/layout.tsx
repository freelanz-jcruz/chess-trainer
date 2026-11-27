import RootLayout, { rootMetadata } from '@/components/pages/RootLayout';

export { viewport } from '@/components/pages/RootLayout';
export const metadata = rootMetadata('en');

/** Layout raíz en inglés (/en/). Ver components/pages/RootLayout.tsx. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout locale="en">{children}</RootLayout>;
}
