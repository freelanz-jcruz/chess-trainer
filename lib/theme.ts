/**
 * Temas de la app. Módulo sin 'use client' para que lo pueda leer también ThemeScript (componente de servidor).
 * 'dark' es el gris oscuro: el nombre se conserva por compatibilidad con progresos guardados.
 */
export type Theme = 'navy' | 'dark' | 'light';

/** En el orden en que los recorre el botón de la cabecera. */
export const THEMES: readonly Theme[] = ['navy', 'dark', 'light'];

export const DEFAULT_THEME: Theme = 'navy';

export const THEME_LABEL: Record<Theme, string> = { navy: 'Azul marino', dark: 'Gris oscuro', light: 'Claro' };

/** Color de la barra del navegador / sistema para cada tema (igual que --background). */
export const THEME_COLOR: Record<Theme, string> = { navy: '#152747', dark: '#1d1b19', light: '#f6f3ee' };
