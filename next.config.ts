import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Para publicar en un subdirectorio (p. ej. GitHub Pages) se definirá basePath.
};

export default nextConfig;
