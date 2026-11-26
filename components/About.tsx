'use client';
import { Info } from 'lucide-react';
import { useState } from 'react';
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
 * «Acerca de Ajedrez Tutor» (página de créditos): icono, nombre, versión y commit. Antes se mostraba sola la
 * primera vez; ahora la bienvenida es un aviso en el temario (components/WelcomeBanner.tsx).
 */
export function AboutButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Info /> Acerca de Ajedrez Tutor
      </Button>
      <AboutDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function AboutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
          <AlertDialogAction className="w-full">Cerrar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
