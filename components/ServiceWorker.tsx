'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { withBase } from '@/lib/base-path';
// Empieza a escuchar el aviso de instalación desde la primera página (llega antes de abrir Ajustes).
import '@/lib/install';

/**
 * Registra el service worker (solo en producción) y avisa (con Sonner) cuando hay una versión nueva esperando.
 * La versión nueva no se activa sola: así no cambia el código a mitad de un ejercicio.
 */
export default function ServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    let reg: ServiceWorkerRegistration | null = null;
    // Buscar actualizaciones al volver a la app.
    const onVisible = () => {
      if (document.visibilityState === 'visible') reg?.update().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);

    navigator.serviceWorker
      .register(withBase('/sw.js'), { scope: withBase('/') })
      .then((r) => {
        reg = r;
        if (r.waiting && navigator.serviceWorker.controller) setWaiting(r.waiting);
        r.addEventListener('updatefound', () => {
          const sw = r.installing;
          sw?.addEventListener('statechange', () => {
            if (sw.state !== 'installed') return;
            if (navigator.serviceWorker.controller) {
              setWaiting(sw); // actualización: hay una versión anterior activa
            } else {
              setOfflineReady(true); // primera instalación
            }
          });
        });
      })
      .catch(() => {
        /* sin service worker la app sigue funcionando con conexión */
      });
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  useEffect(() => {
    if (!waiting) return;
    const update = () => {
      navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
      waiting.postMessage({ type: 'SKIP_WAITING' });
    };
    // Se queda hasta que se pulse: así no se pierde el aviso.
    toast('Hay una versión nueva', {
      id: 'sw-update',
      duration: Infinity,
      action: { label: 'Actualizar', onClick: update },
    });
  }, [waiting]);

  useEffect(() => {
    if (offlineReady) toast.success('Lista para usar sin conexión', { id: 'sw-offline' });
  }, [offlineReady]);

  return null;
}
