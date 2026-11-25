'use client';
import { useSyncExternalStore } from 'react';

/**
 * Instalar la app en la pantalla de inicio.
 * - Android y Chrome/Edge de escritorio lanzan `beforeinstallprompt`: se guarda para abrir el diálogo del
 *   navegador desde un botón propio. El evento llega pronto (al cargar cualquier página), por eso se escucha
 *   desde este módulo, que se carga en todas las páginas (lo importa components/ServiceWorker.tsx).
 * - Safari en iPhone/iPad no tiene ese evento: solo se puede explicar cómo hacerlo desde Compartir.
 * - Si la app ya se abre como app instalada (modo standalone), no hay nada que ofrecer.
 */
export type InstallState = 'installed' | 'prompt' | 'ios' | 'unsupported';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // sin el aviso automático del navegador: se ofrece desde Ajustes
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    emit();
  });
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  // El iPad con iPadOS se presenta como Mac; se distingue por la pantalla táctil.
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function getState(): InstallState {
  if (installed || isStandalone()) return 'installed';
  if (deferred) return 'prompt';
  if (isIOS()) return 'ios';
  return 'unsupported';
}

/** Estado de instalación; en el servidor (HTML estático) se da por no disponible. */
export function useInstallState(): InstallState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getState,
    () => 'unsupported',
  );
}

/** Abre el diálogo de instalación del navegador (solo en estado 'prompt'). */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const e = deferred;
  await e.prompt();
  const { outcome } = await e.userChoice;
  // El evento solo sirve una vez; si se rechaza, el navegador puede volver a lanzarlo más tarde.
  deferred = null;
  emit();
  return outcome === 'accepted';
}
