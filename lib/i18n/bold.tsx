import { Fragment } from 'react';

/**
 * Texto del diccionario con **negritas**: así una frase con una parte destacada sigue siendo una sola
 * entrada (cada idioma coloca la negrita donde le corresponda).
 */
export function Bold({
  text,
  strongClassName,
  highlight,
}: {
  text: string;
  strongClassName?: string;
  /** Otra forma de resaltar la parte entre ** (por defecto, <strong>). */
  highlight?: (part: string) => React.ReactNode;
}) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          highlight ? (
            <Fragment key={i}>{highlight(part.slice(2, -2))}</Fragment>
          ) : (
            <strong key={i} className={strongClassName}>
              {part.slice(2, -2)}
            </strong>
          )
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * Frase del diccionario con huecos `{nombre}` para enlaces u otros elementos: «Problema {link} de Lichess».
 * Así el enlace va dentro de la frase y cada idioma lo coloca donde toque. Admite también **negritas**.
 */
export function Fill({
  text,
  values,
  strongClassName,
}: {
  text: string;
  values: Record<string, React.ReactNode>;
  strongClassName?: string;
}) {
  return (
    <>
      {text.split(/(\{\w+\})/g).map((part, i) => {
        const key = /^\{(\w+)\}$/.exec(part)?.[1];
        return (
          <Fragment key={i}>
            {key && key in values ? values[key] : <Bold text={part} strongClassName={strongClassName} />}
          </Fragment>
        );
      })}
    </>
  );
}
