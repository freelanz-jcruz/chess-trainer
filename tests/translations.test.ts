import { describe, expect, it } from 'vitest';
import { applyPhrases, checkPhrases, textEntries } from '../lib/content/translations';
import { lessons, openings } from '../lib/content/load';

const sample = {
  id: 'x',
  title: 'Título',
  fen: '8/8/8/8/8/8/8/8 w - - 0 1',
  pages: [
    { kind: 'quiz', body: 'Pregunta', options: ['Sí', 'No'], answer: 0 },
    { kind: 'move', body: 'Juega', hint: 'Pista', accept: ['e2e4'] },
  ],
};

describe('traducción del contenido', () => {
  it('lista solo los campos de texto, con su ruta', () => {
    expect(textEntries(sample)).toEqual([
      ['title', 'Título'],
      ['pages.0.body', 'Pregunta'],
      ['pages.0.options.0', 'Sí'],
      ['pages.0.options.1', 'No'],
      ['pages.1.body', 'Juega'],
      ['pages.1.hint', 'Pista'],
    ]);
  });

  it('aplica las frases al día y deja en español las desfasadas o vacías', () => {
    const out = applyPhrases(sample, {
      title: { from: 'Título', to: 'Title' },
      'pages.0.options.0': { from: 'Sí', to: 'Yes' },
      'pages.1.body': { from: 'Juega otra', to: 'Play another' },
      'pages.1.hint': { from: 'Pista', to: '' },
    });
    expect(out.title).toBe('Title');
    expect(out.pages[0].options).toEqual(['Yes', 'No']);
    expect(out.pages[1].body).toBe('Juega');
    expect(out.pages[1].hint).toBe('Pista');
    expect(out.fen).toBe(sample.fen);
    expect(sample.title).toBe('Título'); // no modifica el original
  });

  it('detecta rutas inexistentes, originales cambiados y frases sin traducir', () => {
    const r = checkPhrases(sample, {
      title: { from: 'Título', to: 'Title' },
      'pages.1.body': { from: 'Juega otra', to: 'Play' },
      'pages.9.body': { from: 'X', to: 'Y' },
    });
    expect(r.unknown).toEqual(['pages.9.body']);
    expect(r.outdated).toEqual(['pages.1.body']);
    expect(r.missing).toEqual(['pages.0.body', 'pages.0.options.0', 'pages.0.options.1', 'pages.1.body', 'pages.1.hint']);
  });

  it('encuentra textos en todas las lecciones y aperturas (incluidas las notas de las ramas)', () => {
    for (const l of lessons) expect(textEntries(l).length).toBeGreaterThan(l.pages.length);
    const withBranches = openings.find((o) => o.steps.some((s) => s.branches?.length))!;
    expect(textEntries(withBranches).some(([k]) => /branches\.\d+\.(name|steps\.\d+\.note)$/.test(k))).toBe(true);
  });
});
