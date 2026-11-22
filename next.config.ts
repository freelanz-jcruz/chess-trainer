import type { NextConfig } from 'next';

// Para publicar en un subdirectorio (p. ej. GitHub Pages: /chess-trainer) se define BASE_PATH al compilar.
const basePath = process.env.BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
