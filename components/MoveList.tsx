'use client';
import { cn } from '@/lib/utils';
import { useSan, useT } from '@/lib/i18n/react';

/** Lista de jugadas con números; resalta la actual y permite saltar a una. */
export default function MoveList({
  sans,
  current,
  startPly = 0,
  onSelect,
}: {
  sans: string[];
  /** Índice de la última jugada mostrada en el tablero (-1 = ninguna). */
  current: number;
  startPly?: number;
  onSelect?: (index: number) => void;
}) {
  const t = useT();
  const { san: formatSan } = useSan();
  return (
    <ol className="flex flex-wrap gap-x-1 gap-y-0.5 tabular-nums" aria-label={t.moveList.label}>
      {sans.map((san, i) => {
        const ply = startPly + i;
        const num = ply % 2 === 0 ? `${ply / 2 + 1}.` : i === 0 ? `${Math.floor(ply / 2) + 1}...` : '';
        return (
          <li key={i} className="flex items-center">
            {num && <span className="mr-0.5 ml-1.5 text-[0.9rem] text-muted-foreground">{num}</span>}
            <button
              type="button"
              className={cn('rounded-md px-1.5 py-0.5', i === current && 'bg-primary text-primary-foreground')}
              onClick={onSelect ? () => onSelect(i) : undefined}
              disabled={!onSelect}
            >
              {formatSan(san)}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
