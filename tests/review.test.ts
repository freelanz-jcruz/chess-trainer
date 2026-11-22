import { describe, expect, it } from 'vitest';
import { addDays, applySchedule, dueItems, INTERVALS, MAX_BOX, nextDueDay, scheduleNext } from '@/lib/progress/review';
import { normalizeProgress, parseProgress } from '@/lib/progress/store';

const DAY = '2026-11-22';

describe('fechas', () => {
  it('suma días cruzando meses y años', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });
});

describe('cajas de Leitner', () => {
  it('un problema resuelto a la primera no entra en el repaso', () => {
    expect(scheduleNext('puzzle', undefined, true, DAY)).toBeNull();
  });

  it('un problema fallado entra en la caja 1 para mañana', () => {
    expect(scheduleNext('puzzle', undefined, false, DAY)).toEqual({ box: 1, due: '2026-11-23' });
  });

  it('cada acierto sube una caja y alarga el intervalo; un fallo vuelve a la caja 1', () => {
    let item = scheduleNext('puzzle', undefined, false, DAY)!;
    for (let box = 2; box <= MAX_BOX; box++) {
      item = scheduleNext('puzzle', item, true, DAY)!;
      expect(item).toEqual({ box, due: addDays(DAY, INTERVALS[box]) });
    }
    expect(scheduleNext('puzzle', item, false, DAY)).toEqual({ box: 1, due: '2026-11-23' });
  });

  it('un problema acertado en la última caja sale del repaso', () => {
    expect(scheduleNext('puzzle', { box: MAX_BOX, due: DAY }, true, DAY)).toBeNull();
  });

  it('una apertura entra al practicarla y se queda en la última caja', () => {
    expect(scheduleNext('opening', undefined, true, DAY)).toEqual({ box: 1, due: '2026-11-23' });
    expect(scheduleNext('opening', { box: MAX_BOX, due: DAY }, true, DAY)).toEqual({ box: MAX_BOX, due: addDays(DAY, 30) });
  });

  it('lista lo pendiente de hoy, los más atrasados primero', () => {
    let r = applySchedule({}, 'puzzle', 'a', false, '2026-11-20'); // vence el 21
    r = applySchedule(r, 'puzzle', 'b', false, '2026-11-18'); // vence el 19
    r = applySchedule(r, 'opening', 'italiana', true, DAY); // vence el 23
    expect(dueItems(r, DAY).map((d) => d.id)).toEqual(['b', 'a']);
    expect(dueItems(r, DAY, 'opening')).toEqual([]);
    expect(nextDueDay(r, DAY)).toBe('2026-11-23');
    r = applySchedule(r, 'puzzle', 'b', true, DAY); // caja 2: dentro de 3 días
    expect(dueItems(r, DAY).map((d) => d.id)).toEqual(['a']);
  });
});

describe('progreso guardado e importado', () => {
  it('el progreso antiguo, sin repasos, se lee con un repaso vacío', () => {
    const p = parseProgress(JSON.stringify({ version: 1, openings: {}, puzzles: {}, lessons: {}, settings: {} }));
    expect(p.reviews).toEqual({});
    expect(p.settings.engineTimeMs).toBe(1000);
  });

  it('rechaza ficheros que no son progreso de la app', () => {
    expect(normalizeProgress(null)).toBeNull();
    expect(normalizeProgress([])).toBeNull();
    expect(normalizeProgress({ version: 2 })).toBeNull();
    expect(normalizeProgress({ hola: 'mundo' })).toBeNull();
  });

  it('conserva los datos al exportar e importar', () => {
    const original = parseProgress(null);
    original.puzzles.x = { solved: true, firstTry: false, attempts: 2, hintUsed: true };
    original.reviews['puzzle:x'] = { box: 2, due: DAY };
    const again = normalizeProgress(JSON.parse(JSON.stringify(original)));
    expect(again).toEqual(original);
  });
});
