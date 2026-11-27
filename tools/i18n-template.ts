/**
 * Crea o completa los ficheros de frases de un idioma: npm run i18n:template -- <idioma>
 *
 * Escribe content/i18n/<idioma>/curriculum.json, lessons/<id>.json y openings/<id>.json con todos los
 * textos del original ({ ruta: { from, to } }). Las traducciones que ya hubiera se conservan; las frases
 * nuevas llegan con `to` vacío (se muestran en español hasta traducirlas). Después hay que registrar
 * los ficheros en content/i18n/index.ts y pasar `npm run validate`. Ver lib/content/translations.ts.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { curriculum, lessons, openings } from '../lib/content/load';
import { textEntries, type Phrases } from '../lib/content/translations';
import { DEFAULT_LOCALE, LOCALES } from '../lib/i18n';

const locale = process.argv[2];
if (!locale || locale === DEFAULT_LOCALE) {
  console.error(`Uso: npm run i18n:template -- <idioma>  (el español, ${DEFAULT_LOCALE}, es el original)`);
  process.exit(1);
}
if (!(LOCALES as readonly string[]).includes(locale)) {
  console.warn(`Aviso: «${locale}» aún no está en LOCALES (lib/i18n/locales.ts).`);
}

const DIR = join(import.meta.dirname, '..', 'content', 'i18n', locale);
let created = 0;
let added = 0;

function write(rel: string, source: unknown) {
  const file = join(DIR, rel);
  const old: Phrases = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  const next: Phrases = { ...old };
  for (const [path, text] of textEntries(source)) {
    if (!next[path]) {
      next[path] = { from: text, to: '' };
      added++;
    }
  }
  if (!existsSync(file)) created++;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
}

write('curriculum.json', curriculum);
for (const l of lessons) write(join('lessons', `${l.id}.json`), l);
for (const o of openings) write(join('openings', `${o.id}.json`), o);
console.log(`content/i18n/${locale}: ${created} fichero(s) nuevo(s), ${added} frase(s) añadida(s) para traducir.`);
console.log('Recuerda registrarlos en content/i18n/index.ts.');
