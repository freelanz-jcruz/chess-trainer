'use client';
import { useEffect, useRef, useState } from 'react';
import { localDay } from '@/lib/progress/review';
import { currentProgress, normalizeProgress, replaceProgress, useProgress, type Progress } from '@/lib/progress/store';

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

/** Exportar e importar el progreso (fichero JSON) y cambiar los ajustes. */
export default function ProgressTools() {
  const { progress, update } = useProgress();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!mounted) return <p>Cargando…</p>;

  const exportProgress = () => {
    const data = { app: APP, exported: new Date().toISOString(), progress: currentProgress() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-trainer-progreso-${localDay()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ kind: 'ok', text: 'Progreso exportado. Guarda el fichero donde quieras.' });
  };

  const importFile = async (file: File) => {
    setMessage(null);
    let parsed: Progress | null = null;
    try {
      const data = JSON.parse(await file.text());
      // Se admite el formato exportado ({ app, progress }) y el progreso tal cual.
      parsed = normalizeProgress(data && data.app === APP ? data.progress : data);
    } catch {
      parsed = null;
    }
    if (!parsed) {
      setMessage({ kind: 'error', text: 'Ese fichero no es un progreso de Chess Trainer.' });
      return;
    }
    const ok = window.confirm(
      `El fichero tiene ${summary(parsed)}.\n\nSustituirá tu progreso actual en este dispositivo (${summary(progress)}). ¿Continuar?`,
    );
    if (!ok) return;
    replaceProgress(parsed);
    setMessage({ kind: 'ok', text: 'Progreso importado.' });
  };

  return (
    <div className="progress-tools">
      <section>
        <h2>Tu progreso</h2>
        <p className="muted small">El progreso solo se guarda en este navegador: {summary(progress)}.</p>
        <p className="muted small">
          Para no perderlo o pasarlo a otro dispositivo, expórtalo a un fichero y luego impórtalo donde quieras.
        </p>
        <div className="controls">
          <button type="button" className="primary" onClick={exportProgress}>
            Exportar progreso
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}>
            Importar progreso…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) void importFile(f);
            }}
          />
        </div>
        {message && (
          <p className={message.kind === 'ok' ? 'feedback verdict-correct' : 'feedback verdict-mistake'} role="status">
            {message.text}
          </p>
        )}
      </section>

      <section>
        <h2>Ajustes</h2>
        <label className="setting">
          <input
            type="checkbox"
            checked={progress.settings.showCoordinates}
            onChange={(e) => update((p) => ({ ...p, settings: { ...p.settings, showCoordinates: e.target.checked } }))}
          />{' '}
          Mostrar coordenadas en el tablero
        </label>
        <label className="setting">
          Tiempo de análisis de Stockfish por jugada:{' '}
          <select
            value={progress.settings.engineTimeMs}
            onChange={(e) => update((p) => ({ ...p, settings: { ...p.settings, engineTimeMs: Number(e.target.value) } }))}
          >
            <option value={500}>0,5 s (más rápido)</option>
            <option value={1000}>1 s</option>
            <option value={2000}>2 s (más preciso)</option>
          </select>
        </label>
      </section>
    </div>
  );
}
