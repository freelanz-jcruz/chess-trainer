'use client';
import { Share, SquarePlus, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { promptInstall, useInstallState } from '@/lib/install';

/** Fila de Ajustes para añadir la app a la pantalla de inicio. No se muestra si no aplica. */
export default function InstallApp({ row }: { row: (content: React.ReactNode, description: string) => React.ReactNode }) {
  const state = useInstallState();
  if (state === 'unsupported') return null;

  if (state === 'installed') return row(<span className="text-sm text-muted-foreground">Instalada</span>, 'Ya la tienes en la pantalla de inicio.');

  if (state === 'prompt') {
    return row(
      <Button
        variant="outline"
        onClick={async () => {
          if (await promptInstall()) toast.success('App instalada en la pantalla de inicio.');
        }}
      >
        <Smartphone /> Instalar
      </Button>,
      'Ábrela desde la pantalla de inicio, a pantalla completa y también sin conexión.',
    );
  }

  // iPhone / iPad: Safari no permite abrir la instalación desde la página; se explican los pasos.
  return row(
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Smartphone /> Cómo hacerlo
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Añadir a la pantalla de inicio</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <ol className="m-0 grid list-decimal gap-2 pl-5 text-left">
              <li>
                Toca el botón <strong className="text-foreground">Compartir</strong>{' '}
                <Share aria-label="(icono de compartir)" className="inline size-4 align-text-bottom" /> de Safari, en la barra
                de abajo o arriba.
              </li>
              <li>
                Elige <strong className="text-foreground">Añadir a pantalla de inicio</strong>{' '}
                <SquarePlus aria-hidden className="inline size-4 align-text-bottom" />. Si no aparece, desliza la lista hacia
                abajo.
              </li>
              <li>
                Pulsa <strong className="text-foreground">Añadir</strong>. La app aparecerá con su icono junto a las demás.
              </li>
            </ol>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
    'Ábrela desde la pantalla de inicio, a pantalla completa y también sin conexión.',
  );
}
