'use client';
import { Moon, MoonStar, Sun, type LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/lib/progress/store';
import { THEME_COLOR, THEME_LABEL, THEMES, type Theme } from '@/lib/theme';

const THEME_ICON: Record<Theme, LucideIcon> = { navy: MoonStar, dark: Moon, light: Sun };

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // El gris oscuro es la base del CSS (:root); los otros dos se activan con data-theme.
  if (theme === 'dark') delete root.dataset.theme;
  else root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

/** Mantiene el tema de la página igual que el ajuste guardado (también tras importar un progreso). */
export function useThemeSync() {
  const { progress } = useProgress();
  const theme = progress.settings.theme;
  useEffect(() => applyTheme(theme), [theme]);
}

/** Botón de la cabecera: pasa al siguiente tema (azul marino → gris oscuro → claro → azul marino). */
export function ThemeToggle() {
  const { progress, update } = useProgress();
  useThemeSync();
  const theme = progress.settings.theme;
  const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  // Se muestra el icono del tema al que se cambia.
  const Icon = THEME_ICON[next];
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full bg-transparent shadow-none hover:border-primary hover:bg-transparent hover:text-primary"
      onClick={() => update((p) => ({ ...p, settings: { ...p.settings, theme: next } }))}
      aria-label={`Cambiar a tema ${THEME_LABEL[next].toLowerCase()}`}
      title={`Tema ${THEME_LABEL[next].toLowerCase()}`}
    >
      <Icon aria-hidden className="size-[18px]" strokeWidth={1.8} />
    </Button>
  );
}
