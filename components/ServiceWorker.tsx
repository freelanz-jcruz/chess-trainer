'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { withBase } from '@/lib/base-path';
import { useT } from '@/lib/i18n/react';
// Empieza a escuchar el aviso de instalación desde la primera página (llega antes de abrir Ajustes).
import '@/lib/install';

/**
 * Registra el service worker (solo en producción) y avisa (con Sonner) cuando hay una versión nueva esperando.
 * La versión nueva no se activa sola: así no cambia el código a mitad de un ejercicio.
 */
export default function ServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const t = useT();
  const tn = t.notices;

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
    // Se queda hasta que se pulse. «Más tarde» lo cierra; vuelve a salir la próxima vez que se abra la app.
    toast.custom(
      (id) => (
        <AppNotice
          title={tn.updateTitle}
          text={tn.updateText}
          actions={
            <>
              <Button size="sm" onClick={update}>
                {tn.update}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast.dismiss(id)}>
                {tn.later}
              </Button>
            </>
          }
        />
      ),
      { id: 'sw-update', duration: Infinity },
    );
  }, [waiting, tn]);

  useEffect(() => {
    if (!offlineReady) return;
    // Solo sale una vez (primera instalación del service worker); se cierra solo tras unos segundos.
    toast.custom(
      (id) => (
        <AppNotice
          title={tn.offlineTitle}
          text={tn.offlineText}
          actions={
            <Button size="sm" variant="outline" onClick={() => toast.dismiss(id)}>
              {t.common.understood}
            </Button>
          }
        />
      ),
      { id: 'sw-offline', duration: 12000 },
    );
  }, [offlineReady, tn, t.common.understood]);

  return null;
}

/** Avisos de la app: más grandes que un toast normal y con el icono, para que no pasen desapercibidos. */
function AppNotice({ title, text, actions }: { title: string; text: string; actions: React.ReactNode }) {
  return (
    <div
      role="status"
      className="flex w-[min(calc(100vw-2rem),26rem)] items-center gap-4 rounded-2xl border border-primary/60 bg-popover p-4 text-popover-foreground shadow-2xl"
    >
      <img src={withBase('/icons/icon-192.png')} alt="" width={56} height={56} className="size-14 shrink-0 rounded-xl" />
      <div className="grid min-w-0 flex-1 gap-2">
        <div>
          <p className="m-0 font-semibold">{title}</p>
          <p className="m-0 text-sm text-muted-foreground">{text}</p>
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
    </div>
  );
}
