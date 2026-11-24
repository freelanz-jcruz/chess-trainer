import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import type { NextConfig } from 'next';

// Para publicar en un subdirectorio (p. ej. GitHub Pages: /chess-trainer) se define BASE_PATH al compilar.
const basePath = process.env.BASE_PATH ?? '';

/**
 * Versión que se muestra al pie: la de package.json y el commit con el que se compiló. Si había cambios
 * sin confirmar, el commit lleva un «+» (lo compilado no coincide exactamente con ese commit).
 */
const version = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version as string;
function gitCommit(): string {
  try {
    const hash = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const dirty = execSync('git status --porcelain', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() !== '';
    return hash + (dirty ? '+' : '');
  } catch {
    return ''; // sin git (p. ej. compilando desde un .zip)
  }
}

/**
 * Direcciones IPv4 de este equipo en la red local. `next dev` bloquea sus recursos (el JavaScript de la
 * página) si se abre desde otra dirección que no sea localhost, p. ej. desde el móvil en la misma wifi;
 * así se permiten sin tener que escribir la IP, que cambia según la red. Solo afecta al servidor de desarrollo.
 */
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((a) => a && a.family === 'IPv4' && !a.internal)
  .map((a) => a!.address);

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_APP_VERSION: version, NEXT_PUBLIC_APP_COMMIT: gitCommit() },
  allowedDevOrigins: lanAddresses,
};

export default nextConfig;
