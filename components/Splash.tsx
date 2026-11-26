'use client';
import { Info } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { withBase } from '@/lib/base-path';
import { VERSION_LABEL } from '@/lib/version';

/**
 * Se guarda aparte del progreso: borrar el progreso o importar otro no vuelve a mostrar la bienvenida.
 * Si localStorage no está disponible (navegación privada estricta), se muestra en cada visita.
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
    // Sin almacenamiento: no pasa nada, solo se volverá a mostrar.
  }
}

/** Bienvenida la primera vez que se abre la app: icono, nombre, versión y commit. */
export default function Splash() {
  const [open, setOpen] = useState(false);
  const path = usePathname() ?? '/';
  // En la presentación (/info) no: ya presenta la app, y quien llega desde un buscador la lee primero.
  const onLanding = path.startsWith('/info');
  // Solo en el cliente y tras montar: en el HTML estático no se sabe si ya se vio.
  useEffect(() => {
    if (!onLanding && !seen()) setOpen(true);
  }, [onLanding]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) markSeen();
  };

  return <SplashDialog open={open} onOpenChange={onOpenChange} action="Empezar" />;
}

/** «Acerca de Ajedrez Tutor» (página de créditos): la misma ventana, a petición. */
export function AboutButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Info /> Acerca de Ajedrez Tutor
      </Button>
      <SplashDialog open={open} onOpenChange={setOpen} action="Cerrar" />
    </>
  );
}

function SplashDialog({
  open,
  onOpenChange,
  action,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xs justify-items-center gap-5 text-center sm:max-w-xs">
        {/* El icono con su fondo, tal como se ve al instalar la app. */}
        <img src={withBase('/icons/icon-512.png')} alt="" width={128} height={128} className="size-32 drop-shadow-lg" />
        <AlertDialogHeader className="items-center gap-1 text-center sm:text-center">
          <AlertDialogTitle className="text-2xl tracking-tight">Ajedrez Tutor</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-foreground/80">
            Aprende ajedrez desde cero, a tu ritmo.
          </AlertDialogDescription>
          <p className="text-xs text-muted-foreground tabular-nums">{VERSION_LABEL}</p>
        </AlertDialogHeader>
        <AlertDialogFooter className="w-full sm:justify-center">
          <AlertDialogAction className="w-full">{action}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
