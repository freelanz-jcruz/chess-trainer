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
import InstallApp from '@/components/InstallApp';
import { localDay } from '@/lib/progress/review';
import {
  currentProgress,
  normalizeProgress,
  replaceProgress,
  resetKeepingSettings,
  useProgress,
  type Progress,
  type Settings,
} from '@/lib/progress/store';
import { LEVELS, type Level } from '@/lib/content/levels';
import { THEMES, type Theme } from '@/lib/theme';
import { Bold } from '@/lib/i18n/bold';
import { useT } from '@/lib/i18n/react';
import type { Messages } from '@/lib/i18n';

const APP = 'chess-trainer';

/** Resumen corto de un progreso, para confirmar antes de importarlo. */
function summaryOf(p: Progress, t: Messages['progress']): string {
  const lessons = Object.values(p.lessons).filter((l) => l.completed).length;
  const puzzles = Object.values(p.puzzles).filter((x) => x.solved).length;
  const openings = Object.values(p.openings).filter((o) => o.practiceRuns > 0).length;
  return t.summary(lessons, puzzles, openings, Object.keys(p.reviews).length);
}

/** Exportar e importar el progreso (fichero JSON), borrarlo y cambiar los ajustes. */
export default function ProgressTools() {
  const { progress, update } = useProgress();
  const t = useT();
  const tp = t.progress;
  const ts = t.settings;
  const summary = (p: Progress) => summaryOf(p, tp);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Progreso leído de un fichero, a la espera de confirmar la importación.
  const [pending, setPending] = useState<Progress | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!mounted) return <p className="my-4">{tp.loading}</p>;

  const setSetting = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    update((p) => ({ ...p, settings: { ...p.settings, [key]: value } }));

  const exportProgress = () => {
    const data = { app: APP, exported: new Date().toISOString(), progress: currentProgress() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tp.exportFileName(localDay());
    a.click();
    URL.revokeObjectURL(url);
    toast.success(tp.exported, { description: tp.exportedDetail });
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
    else toast.error(tp.notAProgressFile);
  };

  const confirmImport = () => {
    if (!pending) return;
    replaceProgress(pending);
    setPending(null);
    toast.success(tp.imported);
  };

  const resetAll = () => {
    replaceProgress(resetKeepingSettings(currentProgress()));
    toast.success(tp.deleted, { description: tp.deletedDetail });
  };

  return (
    <div className="mt-4 grid max-w-2xl gap-8">
      <section className="grid gap-3">
        <h2>{tp.title}</h2>
        <p className="m-0 text-sm text-muted-foreground">
          {tp.intro(summary(progress))}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportProgress}>
            <Download /> {tp.export}
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload /> {tp.import}
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
              <AlertDialogTitle>{tp.importTitle}</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="grid gap-2">
                  <p className="m-0">
                    {pending && <Bold text={tp.importHas(summary(pending))} strongClassName="text-foreground" />}
                  </p>
                  <p className="m-0">
                    <Bold text={tp.importReplaces(summary(progress))} strongClassName="text-foreground" />
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tp.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmImport}>{tp.importConfirm}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mt-2 grid gap-2 border-t border-dashed border-border pt-4">
          <p className="m-0 text-sm text-muted-foreground">
            {tp.deleteIntro}
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline-destructive" className="w-fit">
                <Trash2 /> {tp.delete}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{tp.deleteTitle}</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="grid gap-2">
                    <p className="m-0">{tp.deleteWhat(summary(progress))}</p>
                    <p className="m-0">
                      <Bold text={tp.deleteWarning} strongClassName="text-foreground" />
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tp.cancel}</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={resetAll}>
                  {tp.deleteConfirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      <section className="grid gap-3">
        <h2>{ts.title}</h2>
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          <SettingRow
            title={ts.level}
            description={ts.levelHelp}
          >
            <RadioGroup
              aria-label={ts.level}
              className="flex flex-wrap gap-x-4 gap-y-2"
              value={progress.settings.level}
              onValueChange={(v) => setSetting('level', v as Level)}
            >
              {LEVELS.map((l) => (
                <Label key={l} className="cursor-pointer font-normal">
                  <RadioGroupItem value={l} />
                  {t.level[l]}
                </Label>
              ))}
            </RadioGroup>
          </SettingRow>
          <SettingRow title={ts.theme} description={ts.themeHelp}>
            <RadioGroup
              aria-label={ts.theme}
              className="flex flex-wrap gap-x-4 gap-y-2"
              value={progress.settings.theme}
              onValueChange={(v) => setSetting('theme', v as Theme)}
            >
              {THEMES.map((th) => (
                <Label key={th} className="cursor-pointer font-normal">
                  <RadioGroupItem value={th} />
                  {t.theme.names[th]}
                </Label>
              ))}
            </RadioGroup>
          </SettingRow>
          <SettingRow
            title={ts.coordinates}
            description={ts.coordinatesHelp}
            htmlFor="coords"
          >
            <Switch
              id="coords"
              checked={progress.settings.showCoordinates}
              onCheckedChange={(v) => setSetting('showCoordinates', v)}
            />
          </SettingRow>
          <SettingRow
            title={ts.engineTime}
            description={ts.engineTimeHelp}
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
                <SelectItem value="500">{ts.engineFast}</SelectItem>
                <SelectItem value="1000">{ts.engineMedium}</SelectItem>
                <SelectItem value="2000">{ts.enginePrecise}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <InstallApp
            row={(control, description) => (
              <SettingRow title={ts.install} description={description}>
                {control}
              </SettingRow>
            )}
          />
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
