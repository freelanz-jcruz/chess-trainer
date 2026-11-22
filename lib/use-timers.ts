'use client';
import { useCallback, useEffect, useRef } from 'react';

/** setTimeout que se cancela al desmontar el componente o al llamar a `clear`. */
export function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => ids.current.forEach(clearTimeout), []);
  const later = useCallback((fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms));
  }, []);
  const clear = useCallback(() => {
    ids.current.forEach(clearTimeout);
    ids.current = [];
  }, []);
  return { later, clear };
}
