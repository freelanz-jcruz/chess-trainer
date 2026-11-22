'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { applySchedule, localDay, type ReviewKind, type Reviews } from './review';

import { KEY } from './key';
export { KEY };

export type OpeningProgress = {
  walkthroughDone: boolean;
  practiceRuns: number;
  cleanRuns: number;
  lastPlayed?: string;
};

export type PuzzleProgress = {
  solved: boolean;
  firstTry: boolean;
  attempts: number;
  hintUsed: boolean;
  lastSeen?: string;
};

export type LessonProgress = { completed: boolean; lastPage: number };

export type Theme = 'dark' | 'light';
export type Settings = { engineTimeMs: number; showCoordinates: boolean; theme: Theme };

export type Progress = {
  version: 1;
  openings: Record<string, OpeningProgress>;
  puzzles: Record<string, PuzzleProgress>;
  lessons: Record<string, LessonProgress>;
  /** Repaso espaciado: `opening:<id>` / `puzzle:<id>` -> caja y fecha (ver review.ts). */
  reviews: Reviews;
  settings: Settings;
};

export const DEFAULT_SETTINGS: Settings = { engineTimeMs: 1000, showCoordinates: true, theme: 'dark' };

function empty(): Progress {
  return { version: 1, openings: {}, puzzles: {}, lessons: {}, reviews: {}, settings: { ...DEFAULT_SETTINGS } };
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Normaliza un objeto de progreso ya leído; null si no tiene el formato esperado. */
export function normalizeProgress(data: unknown): Progress | null {
  if (!isRecord(data) || data.version !== 1) return null;
  const rec = <T,>(v: unknown) => (isRecord(v) ? (v as Record<string, T>) : {});
  return {
    version: 1,
    openings: rec<OpeningProgress>(data.openings),
    puzzles: rec<PuzzleProgress>(data.puzzles),
    lessons: rec<LessonProgress>(data.lessons),
    reviews: rec(data.reviews) as Reviews,
    settings: { ...DEFAULT_SETTINGS, ...(isRecord(data.settings) ? (data.settings as Partial<Settings>) : {}) },
  };
}

/** Lee y normaliza el progreso; tolera datos corruptos o almacenamiento bloqueado. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return empty();
  try {
    return normalizeProgress(JSON.parse(raw)) ?? empty();
  } catch {
    return empty();
  }
}

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  if (cache) return cache;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* modo privado o almacenamiento bloqueado: se trabaja en memoria */
  }
  cache = parseProgress(raw);
  return cache;
}

function write(next: Progress) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* sin persistencia */
  }
  listeners.forEach((l) => l());
}

const SERVER_SNAPSHOT = empty();

export function useProgress() {
  const progress = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => SERVER_SNAPSHOT,
  );
  const update = useCallback((fn: (p: Progress) => Progress) => write(fn(read())), []);
  return { progress, update };
}

/** Progreso vacío que conserva los ajustes (tema, coordenadas, tiempo de análisis). */
export function resetKeepingSettings(p: Progress): Progress {
  return { ...empty(), settings: { ...p.settings } };
}

/** Sustituye todo el progreso (importación). */
export function replaceProgress(next: Progress) {
  write(next);
}

/** Progreso actual tal como está guardado (exportación). */
export const currentProgress = () => read();

export const today = () => localDay();

export function updateOpening(p: Progress, id: string, fn: (o: OpeningProgress) => OpeningProgress): Progress {
  const current = p.openings[id] ?? { walkthroughDone: false, practiceRuns: 0, cleanRuns: 0 };
  return { ...p, openings: { ...p.openings, [id]: { ...fn(current), lastPlayed: today() } } };
}

export function updatePuzzle(p: Progress, id: string, fn: (o: PuzzleProgress) => PuzzleProgress): Progress {
  const current = p.puzzles[id] ?? { solved: false, firstTry: false, attempts: 0, hintUsed: false };
  return { ...p, puzzles: { ...p.puzzles, [id]: { ...fn(current), lastSeen: today() } } };
}

export function updateLesson(p: Progress, id: string, fn: (o: LessonProgress) => LessonProgress): Progress {
  const current = p.lessons[id] ?? { completed: false, lastPage: 0 };
  return { ...p, lessons: { ...p.lessons, [id]: fn(current) } };
}

/** Registra un intento en el repaso espaciado (`clean` = sin errores ni pistas). */
export function scheduleReview(p: Progress, kind: ReviewKind, id: string, clean: boolean): Progress {
  return { ...p, reviews: applySchedule(p.reviews, kind, id, clean, today()) };
}
