/** Versión de la app (package.json) y commit con el que se compiló; los inyecta next.config.ts. */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '';
/** Commit corto; lleva «+» si había cambios sin confirmar al compilar. Vacío si se compiló sin git. */
export const APP_COMMIT = process.env.NEXT_PUBLIC_APP_COMMIT ?? '';

/** Texto para mostrar, p. ej. «v0.1.0 (41f7521)». */
export const VERSION_LABEL = `v${APP_VERSION}${APP_COMMIT ? ` (${APP_COMMIT})` : ''}`;
