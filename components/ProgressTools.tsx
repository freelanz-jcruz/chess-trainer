'use client';
import { Download, Trash2, Upload } from 'lucide-react';
import type * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { localDay } from '@/lib/progress/review';
import {
  currentProgress,
  normalizeProgress,
  replaceProgress,
  resetKeepingSettings,
  useProgress,
  type Progress,
  type Settings,
  type Theme,
} from '@/lib/progress/store';

const APP = 'chess-trainer';

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Resumen corto de un progreso, para confirmar antes de importarlo. */
function summary(p: Progress): string {
  const lessons = Object.values(p.lessons).filter((l) => l.completed).length;
  const puzzles = Object.values(p.puzzles).filter((x) => x.solved).length;
  const openings = Object.values(p.openings).filter((o) => o.practiceRuns > 0).length;
  return [
    count(lessons, 'lección completada', 'lecciones completadas'),
    count(puzzles, 'problema resuelto', 'problemas resueltos'),
    count(openings, 'apertura practicada', 'aperturas practicadas'),
  ].join(', ') + ` y ${count(Object.keys(p.reviews).length, 'elemento', 'elementos')} en el repaso`;
}

/** Exportar e importar el progreso (fichero JSON), borrarlo y cambiar los ajustes. */
export default function ProgressTools() {
  const { progress, update } = useProgress();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Progreso leído de un fichero, a la espera de confirmar la importación.
  const [pending, setPending] = useState<Progress | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!mounted) return <p className="my-4">Cargando…</p>;

  const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    update((p) => ({ ...p, settings: { ...p.settings, [key]: value } }));

  const exportProgress = () => {
    const data = { app: APP, exported: new Date().toISOString(), progress: currentProgress() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ajedrez-tutor-progreso-${localDay()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Progreso exportado', { description: 'Guarda el fichero donde quieras.' });
  };

  const readFile = async (file: File) => {
    let parsed: Progress | null = null;
    try {
      const data = JSON.parse(await file.text());
      // Se admite el formato exportado ({ app, progress }) y el progreso tal cual.
      parsed = normalizeProgress(data && data.app === APP ? data.progress : data);
    } catch {
      parsed = null;
    }
    if (parsed) setPending(parsed);
    else toast.error('Ese fichero no es un progreso de Ajedrez Tutor.');
  };

  const confirmImport = () => {
    if (!pending) return;
    replaceProgress(pending);
    setPending(null);
    toast.success('Progreso importado');
  };

  const resetAll = () => {
    replaceProgress(resetKeepingSettings(currentProgress()));
    toast.success('Progreso borrado', { description: 'Puedes empezar de cero.' });
  };

  return (
    <div className="mt-4 grid max-w-2xl gap-8">
      <section className="grid gap-3">
        <h2>Tu progreso</h2>
        <p className="m-0 text-sm text-muted-foreground">
          El progreso solo se guarda en este navegador: {summary(progress)}. Para no perderlo o pasarlo a otro
          dispositivo, expórtalo a un fichero y luego impórtalo donde quieras.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportProgress}>
            <Download /> Exportar progreso
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload /> Importar progreso…
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) void readFile(f);
            }}
          />
        </div>

        <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Importar este progreso?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="grid gap-2">
                  <p className="m-0">
                    <strong className="text-foreground">El fichero tiene:</strong> {pending && summary(pending)}.
                  </p>
                  <p className="m-0">
                    <strong className="text-foreground">Sustituirá tu progreso actual</strong> en este dispositivo:{' '}
                    {summary(progress)}.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmImport}>Importar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mt-2 grid gap-2 border-t border-dashed border-border pt-4">
          <p className="m-0 text-sm text-muted-foreground">
            Borrar el progreso elimina lecciones, aperturas, problemas y repasos. Los ajustes se mantienen.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline-destructive" className="w-fit">
                <Trash2 /> Borrar todo el progreso…
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Borrar todo el progreso?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="grid gap-2">
                    <p className="m-0">Se borrará todo tu progreso en este dispositivo: {summary(progress)}.</p>
                    <p className="m-0">
                      Tus ajustes se mantienen. <strong className="text-foreground">No se puede deshacer</strong>: si
                      quieres conservar una copia, exporta antes el progreso.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={resetAll}>
                  Borrar todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      <section className="grid gap-3">
        <h2>Ajustes</h2>
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          <SettingRow title="Tema" description="Oscuro o claro; también desde el botón de la cabecera.">
            <RadioGroup
              aria-label="Tema"
              className="flex gap-4"
              value={progress.settings.theme}
              onValueChange={(v) => setSetting('theme', v as Theme)}
            >
              {(['dark', 'light'] as const).map((t) => (
                <Label key={t} className="cursor-pointer font-normal">
                  <RadioGroupItem value={t} />
                  {t === 'dark' ? 'Oscuro' : 'Claro'}
                </Label>
              ))}
            </RadioGroup>
          </SettingRow>
          <SettingRow
            title="Coordenadas"
            description="Letras y números de filas y columnas en el borde del tablero."
            htmlFor="coords"
          >
            <Switch
              id="coords"
              checked={progress.settings.showCoordinates}
              onCheckedChange={(v) => setSetting('showCoordinates', v)}
            />
          </SettingRow>
          <SettingRow
            title="Tiempo de análisis"
            description="Lo que piensa Stockfish cada jugada: más tiempo, valoraciones más precisas."
            htmlFor="engine-time"
          >
            <Select
              value={String(progress.settings.engineTimeMs)}
              onValueChange={(v) => setSetting('engineTimeMs', Number(v))}
            >
              <SelectTrigger id="engine-time" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">0,5 s (rápido)</SelectItem>
                <SelectItem value="1000">1 s</SelectItem>
                <SelectItem value="2000">2 s (preciso)</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </section>
    </div>
  );
}

/** Fila de ajuste: título y explicación a la izquierda, control a la derecha (debajo en pantallas estrechas). */
function SettingRow({
  title,
  description,
  htmlFor,
  children,
}: {
  title: string;
  description: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3.5">
      <div className="grid min-w-0 flex-1 basis-56 gap-1">
        <Label htmlFor={htmlFor} className="text-[0.95rem] font-semibold">
          {title}
        </Label>
        <p className="m-0 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
