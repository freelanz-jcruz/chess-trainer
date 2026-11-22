/** Prefijo de rutas para ficheros servidos desde public/ (vacío salvo que se compile con BASE_PATH). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const withBase = (path: string) => `${BASE_PATH}${path}`;
