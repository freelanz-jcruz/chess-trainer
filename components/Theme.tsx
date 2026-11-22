'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useProgress, type Theme } from '@/lib/progress/store';

/** Color de la barra del navegador / sistema para cada tema (igual que --bg). */
export const THEME_COLOR: Record<Theme, string> = { dark: '#1d1b19', light: '#f6f3ee' };

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'light') root.dataset.theme = 'light';
  else delete root.dataset.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

/** Mantiene el tema de la página igual que el ajuste guardado (también tras importar un progreso). */
export function useThemeSync() {
  const { progress } = useProgress();
  const theme = progress.settings.theme;
  useEffect(() => applyTheme(theme), [theme]);
}

/** Botón de la cabecera: cambia entre oscuro y claro. */
export function ThemeToggle() {
  const { progress, update } = useProgress();
  useThemeSync();
  const theme = progress.settings.theme;
  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full bg-transparent shadow-none hover:border-primary hover:bg-transparent hover:text-primary"
      onClick={() => update((p) => ({ ...p, settings: { ...p.settings, theme: next } }))}
      aria-label={next === 'light' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={next === 'light' ? 'Tema claro' : 'Tema oscuro'}
    >
      {/* Se muestra el icono del tema al que se cambia. */}
      {next === 'light' ? <Sun aria-hidden className="size-[18px]" strokeWidth={1.8} /> : <Moon aria-hidden className="size-[18px]" strokeWidth={1.8} />}
    </Button>
  );
}
