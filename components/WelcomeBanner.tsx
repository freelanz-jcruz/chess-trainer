'use client';
import Link from 'next/link';
import { ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { InstallButton } from '@/components/InstallApp';
import { Button } from '@/components/ui/button';
import { withBase } from '@/lib/base-path';

/**
 * Misma clave que la antigua ventana de bienvenida: quien ya la vio no vuelve a ver el aviso. Se guarda
 * aparte del progreso (borrarlo o importar otro no lo hace reaparecer). Sin localStorage (navegación
 * privada estricta) se muestra en cada visita, sin más.
 */
const SEEN_KEY = 'chess-trainer:splash-seen';

function seen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Sin almacenamiento: solo se volverá a mostrar.
  }
}

/**
 * Aviso para quien entra por primera vez en el temario: lleva a la presentación (/info) y ofrece
 * instalar la app. Solo en la portada y sin tapar nada: quien llega a una lección desde un buscador o un
 * enlace la ve directamente (y Google no lo toma por una ventana intrusiva).
 */
export default function WelcomeBanner() {
  const [show, setShow] = useState(false);
  // Solo en el cliente y tras montar: en el HTML estático no se sabe si ya se vio.
  useEffect(() => {
    if (!seen()) setShow(true);
  }, []);
  if (!show) return null;

  const dismiss = () => {
    markSeen();
    setShow(false);
  };

  // Mismo estilo que los avisos de actualización y de uso sin conexión (ServiceWorker.tsx), pero dentro de la página.
  return (
    <aside
      aria-label="Bienvenida"
      className="relative my-4 flex items-center gap-4 rounded-2xl border border-primary/60 bg-popover py-4 pr-12 pl-4 text-popover-foreground shadow-2xl"
    >
      <img src={withBase('/icons/icon-192.png')} alt="" width={56} height={56} className="size-14 shrink-0 rounded-xl" />
      <div className="grid min-w-0 flex-1 gap-2">
        <div>
          <p className="m-0 font-semibold">¿Primera vez por aquí?</p>
          <p className="m-0 text-sm text-muted-foreground">Descubre qué puedes aprender con Ajedrez Tutor y cómo instalarla en tu móvil.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild onClick={markSeen}>
            <Link href="/info/">
              Conocer la app <ChevronRight />
            </Link>
          </Button>
          <InstallButton size="default" fallback={false} variant="outline" />
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={dismiss}
        aria-label="Cerrar el aviso"
        className="absolute top-2 right-2 text-muted-foreground"
      >
        <X />
      </Button>
    </aside>
  );
}
