import type * as React from 'react';
import { cn } from '@/lib/utils';

/** Tablero y panel: una columna en móvil, dos a partir del punto `trainer` (820 px). */
export function Trainer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mt-3 grid gap-4 trainer:grid-cols-[minmax(0,560px)_minmax(260px,1fr)] trainer:items-start', className)}
      {...props}
    />
  );
}

/** Columna de texto y controles junto al tablero. */
export function Panel({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('grid content-start gap-3', className)} {...props} />;
}

/** Fila de botones. */
export function Controls({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...props} />;
}

/** Texto secundario pequeño (subtítulos, notas, contadores). */
export function Note({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-sm text-muted-foreground tabular-nums', className)} {...props} />;
}
