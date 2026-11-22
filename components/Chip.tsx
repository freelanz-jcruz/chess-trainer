import { cn } from '@/lib/utils';

/** Clases de una «píldora» seleccionable (temas de ejercicios, variantes de una apertura). */
export function chipClass(active: boolean, className?: string) {
  return cn(
    'inline-flex items-center rounded-full border px-3 py-1 text-left text-[0.9rem] no-underline transition-colors',
    active
      ? 'border-primary bg-primary text-primary-foreground'
      : 'border-border bg-card text-foreground hover:bg-accent',
    className,
  );
}
