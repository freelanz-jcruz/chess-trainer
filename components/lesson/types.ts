import type * as React from 'react';

/** Propiedades comunes de cada tipo de página de lección. */
export type PageProps<P> = {
  page: P;
  /** Avisa de que la página está superada (permite pasar a la siguiente). */
  onComplete: () => void;
  completed: boolean;
  coordinates: boolean;
  engineTimeMs: number;
  /** Botones Anterior/Siguiente de la lección: van al final del panel cuando hay dos columnas. */
  nav: React.ReactNode;
  /** Pasa a la página siguiente (no existe en la última). Lo usa la ventana de resultado en móvil. */
  onNext?: () => void;
};
