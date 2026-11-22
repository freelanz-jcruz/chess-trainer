'use client';
import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'chess-trainer:v1';

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

export type Settings = { engineTimeMs: number; showCoordinates: boolean };

export type Progress = {
  version: 1;
  openings: Record<string, OpeningProgress>;
  puzzles: Record<string, PuzzleProgress>;
  lessons: Record<string, LessonProgress>;
  settings: Settings;
};

export const DEFAULT_SETTINGS: Settings = { engineTimeMs: 1000, showCoordinates: true };

function empty(): Progress {
  return { version: 1, openings: {}, puzzles: {}, lessons: {}, settings: { ...DEFAULT_SETTINGS } };
}

/** Lee y normaliza el progreso; tolera datos corruptos o almacenamiento bloqueado. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return empty();
  try {
    const data = JSON.parse(raw) as Partial<Progress>;
    if (data.version !== 1) return empty();
    return {
      version: 1,
      openings: data.openings ?? {},
      puzzles: data.puzzles ?? {},
      lessons: data.lessons ?? {},
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
    };
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

export const today = () => new Date().toISOString().slice(0, 10);

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
