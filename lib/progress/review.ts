/**
 * Repaso espaciado con cajas de Leitner.
 *
 * - Una apertura entra en el repaso al terminar su primera práctica; un problema, cuando se falla
 *   (error, pista o sin resolver). Un problema resuelto a la primera nunca entra.
 * - Acierto limpio: sube una caja y vuelve a tocar dentro de INTERVALS[caja] días.
 *   Fallo: vuelve a la caja 1 (mañana).
 * - Un problema acertado en la última caja sale del repaso. Una apertura se queda en la última caja
 *   y se repasa cada 30 días: el repertorio no se debe olvidar.
 *
 * Las fechas son días locales (YYYY-MM-DD), sin horas: un repaso «toca» durante todo el día.
 */

/** Días hasta el siguiente repaso para cada caja (índice = caja). */
export const INTERVALS = [0, 1, 3, 7, 14, 30] as const;
export const MAX_BOX = INTERVALS.length - 1;

export type ReviewItem = { box: number; due: string };
export type ReviewKind = 'opening' | 'puzzle';
export type Reviews = Record<string, ReviewItem>;

export const reviewKey = (kind: ReviewKind, id: string) => `${kind}:${id}`;

export function parseReviewKey(key: string): { kind: ReviewKind; id: string } | null {
  const i = key.indexOf(':');
  const kind = key.slice(0, i);
  if (kind !== 'opening' && kind !== 'puzzle') return null;
  return { kind, id: key.slice(i + 1) };
}

/** Día local en formato YYYY-MM-DD. */
export function localDay(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return localDay(new Date(y, m - 1, d + n));
}

/**
 * Nuevo estado de un elemento tras un intento. Devuelve null si sale del repaso
 * (o si nunca entra: problema acertado a la primera).
 */
export function scheduleNext(
  kind: ReviewKind,
  current: ReviewItem | undefined,
  clean: boolean,
  day: string,
): ReviewItem | null {
  if (!clean) return { box: 1, due: addDays(day, INTERVALS[1]) };
  if (!current) {
    // Primera vez y sin fallos: la apertura empieza a repasarse; el problema no hace falta.
    return kind === 'opening' ? { box: 1, due: addDays(day, INTERVALS[1]) } : null;
  }
  if (kind === 'puzzle' && current.box >= MAX_BOX) return null;
  const box = Math.min(current.box + 1, MAX_BOX);
  return { box, due: addDays(day, INTERVALS[box]) };
}

export function applySchedule(reviews: Reviews, kind: ReviewKind, id: string, clean: boolean, day: string): Reviews {
  const key = reviewKey(kind, id);
  const next = scheduleNext(kind, reviews[key], clean, day);
  const { [key]: _old, ...rest } = reviews;
  return next ? { ...rest, [key]: next } : rest;
}

export const isDue = (item: ReviewItem, day: string) => item.due <= day;

/** Elementos que tocan hoy (o están atrasados), los más atrasados primero. */
export function dueItems(reviews: Reviews, day: string, kind?: ReviewKind): { kind: ReviewKind; id: string; item: ReviewItem }[] {
  return Object.entries(reviews)
    .flatMap(([key, item]) => {
      const parsed = parseReviewKey(key);
      return parsed && (!kind || parsed.kind === kind) && isDue(item, day) ? [{ ...parsed, item }] : [];
    })
    .sort((a, b) => a.item.due.localeCompare(b.item.due) || a.id.localeCompare(b.id));
}

/** Próxima fecha con repasos pendientes después de hoy, si la hay. */
export function nextDueDay(reviews: Reviews, day: string): string | undefined {
  return Object.values(reviews)
    .map((r) => r.due)
    .filter((d) => d > day)
    .sort()[0];
}
