/** Propiedades comunes de cada tipo de página de lección. */
export type PageProps<P> = {
  page: P;
  /** Avisa de que la página está superada (permite pasar a la siguiente). */
  onComplete: () => void;
  completed: boolean;
  coordinates: boolean;
  engineTimeMs: number;
};
