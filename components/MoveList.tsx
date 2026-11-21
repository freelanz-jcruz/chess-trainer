import { sanToEs } from '@/lib/chess/notation-es';

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
  return (
    <ol className="move-list" aria-label="Jugadas">
      {sans.map((san, i) => {
        const ply = startPly + i;
        const num = ply % 2 === 0 ? `${ply / 2 + 1}.` : i === 0 ? `${Math.floor(ply / 2) + 1}...` : '';
        return (
          <li key={i}>
            {num && <span className="move-num">{num}</span>}
            <button
              type="button"
              className={i === current ? 'move active' : 'move'}
              onClick={onSelect ? () => onSelect(i) : undefined}
              disabled={!onSelect}
            >
              {sanToEs(san)}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
