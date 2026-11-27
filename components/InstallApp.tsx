'use client';
import Link from 'next/link';
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
import { Bold, Fill } from '@/lib/i18n/bold';
import { useT } from '@/lib/i18n/react';
import type { Messages } from '@/lib/i18n';

async function install(ti: Messages['install']) {
  if (await promptInstall()) toast.success(ti.installed);
}

/** iPhone / iPad: Safari no permite abrir la instalación desde la página; se explican los pasos. */
function IosSteps({ trigger }: { trigger: React.ReactNode }) {
  const t = useT();
  const ti = t.install;
  const strong = 'text-foreground';
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{ti.iosTitle}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <ol className="m-0 grid list-decimal gap-2 pl-5 text-left">
              <li>
                <Fill
                  text={ti.iosStep1}
                  strongClassName={strong}
                  values={{ share: <Share aria-label={ti.iosShareIcon} className="inline size-4 align-text-bottom" /> }}
                />
              </li>
              <li>
                <Fill
                  text={ti.iosStep2}
                  strongClassName={strong}
                  values={{ add: <SquarePlus aria-hidden className="inline size-4 align-text-bottom" /> }}
                />
              </li>
              <li>
                <Bold text={ti.iosStep3} strongClassName={strong} />
              </li>
            </ol>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>{t.common.understood}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Fila de Ajustes para añadir la app a la pantalla de inicio. No se muestra si no aplica. */
export default function InstallApp({ row }: { row: (content: React.ReactNode, description: string) => React.ReactNode }) {
  const state = useInstallState();
  const ti = useT().install;
  if (state === 'unsupported') return null;
  if (state === 'installed') return row(<span className="text-sm text-muted-foreground">{ti.installedLabel}</span>, ti.installedHelp);
  if (state === 'prompt') {
    return row(
      <Button variant="outline" onClick={() => install(ti)}>
        <Smartphone /> {ti.install}
      </Button>,
      ti.benefit,
    );
  }
  return row(
    <IosSteps
      trigger={
        <Button variant="outline">
          <Smartphone /> {ti.howTo}
        </Button>
      }
    />,
    ti.benefit,
  );
}

/**
 * Botón grande de instalar para la landing (/info). Si el navegador no permite instalar desde la página
 * (escritorio sin soporte) o ya está instalada, ofrece empezar directamente (o nada, con `fallback={false}`).
 */
export function InstallButton({
  size = 'lg',
  variant = 'default',
  fallback = true,
}: {
  size?: 'default' | 'lg';
  variant?: 'default' | 'outline';
  fallback?: boolean;
}) {
  const state = useInstallState();
  const ti = useT().install;
  if (state === 'prompt') {
    return (
      <Button size={size} variant={variant} onClick={() => install(ti)}>
        <Smartphone /> {ti.installApp}
      </Button>
    );
  }
  if (state === 'ios') {
    return (
      <IosSteps
        trigger={
          <Button size={size} variant={variant}>
            <Smartphone /> {ti.installIphone}
          </Button>
        }
      />
    );
  }
  if (!fallback) return null;
  return (
    <Button size={size} variant={variant} asChild>
      <Link href="/">{ti.startNow}</Link>
    </Button>
  );
}
