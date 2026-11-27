import RootLayout, { rootMetadata } from '@/components/pages/RootLayout';

export { viewport } from '@/components/pages/RootLayout';
export const metadata = rootMetadata('es');

/** Layout raíz en español (en la raíz del sitio). Ver components/pages/RootLayout.tsx. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout locale="es">{children}</RootLayout>;
}
