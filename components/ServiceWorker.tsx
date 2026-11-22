'use client';
import { useEffect, useState } from 'react';
import { withBase } from '@/lib/base-path';

/**
 * Registra el service worker (solo en producción) y avisa cuando hay una versión nueva esperando.
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
              window.setTimeout(() => setOfflineReady(false), 5000);
            }
          });
        });
      })
      .catch(() => {
        /* sin service worker la app sigue funcionando con conexión */
      });
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const update = () => {
    if (!waiting) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
    waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  if (waiting) {
    return (
      <div className="toast" role="status">
        Hay una versión nueva.{' '}
        <button type="button" className="primary" onClick={update}>
          Actualizar
        </button>
      </div>
    );
  }
  if (offlineReady) {
    return (
      <div className="toast" role="status">
        Lista para usar sin conexión.
      </div>
    );
  }
  return null;
}
