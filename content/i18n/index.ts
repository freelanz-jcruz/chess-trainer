import type { Locale } from '@/lib/i18n/locales';
import type { ContentTranslations } from '@/lib/content/translations';
import enCurriculum from './en/curriculum.json';
import enLAlPaso from './en/lessons/al-paso.json';
import enLCapturaValor from './en/lessons/captura-valor.json';
import enLCoronacion from './en/lessons/coronacion.json';
import enLDamaRey from './en/lessons/dama-rey.json';
import enLEnfiladaDesviacion from './en/lessons/enfilada-desviacion.json';
import enLEnroque from './en/lessons/enroque.json';
import enLJaqueMate from './en/lessons/jaque-mate.json';
import enLLucenaPhilidor from './en/lessons/lucena-philidor.json';
import enLMateCoz from './en/lessons/mate-coz.json';
import enLMatePasillo from './en/lessons/mate-pasillo.json';
import enLMatePastor from './en/lessons/mate-pastor.json';
import enLOposicion from './en/lessons/oposicion.json';
import enLPiezas from './en/lessons/piezas.json';
import enLPrincipios from './en/lessons/principios.json';
import enLPrincipiosPractica from './en/lessons/principios-practica.json';
import enLReyPeon from './en/lessons/rey-peon.json';
import enLTablas from './en/lessons/tablas.json';
import enLTablero from './en/lessons/tablero.json';
import enLTorreRey from './en/lessons/torre-rey.json';
import enOE5ContraE4 from './en/openings/e5-contra-e4.json';
import enOEspanola from './en/openings/espanola.json';
import enOEspanolaCambio from './en/openings/espanola-cambio.json';
import enOEsquemaGdr from './en/openings/esquema-gdr.json';
import enOFegatello from './en/openings/fegatello.json';
import enOGambitoDamaRehusado from './en/openings/gambito-dama-rehusado.json';
import enOItalianaTranquila from './en/openings/italiana-tranquila.json';
import enOLegal from './en/openings/legal.json';

/**
 * Registro de traducciones del contenido por idioma (ver lib/content/translations.ts). El español no
 * aparece: es el original. Los ficheros se crean o completan con `npm run i18n:template -- <idioma>`.
 */
export const CONTENT_TRANSLATIONS: Partial<Record<Locale, ContentTranslations>> = {
  en: {
    curriculum: enCurriculum,
    lessons: {
      'al-paso': enLAlPaso,
      'captura-valor': enLCapturaValor,
      'coronacion': enLCoronacion,
      'dama-rey': enLDamaRey,
      'enfilada-desviacion': enLEnfiladaDesviacion,
      'enroque': enLEnroque,
      'jaque-mate': enLJaqueMate,
      'lucena-philidor': enLLucenaPhilidor,
      'mate-coz': enLMateCoz,
      'mate-pasillo': enLMatePasillo,
      'mate-pastor': enLMatePastor,
      'oposicion': enLOposicion,
      'piezas': enLPiezas,
      'principios': enLPrincipios,
      'principios-practica': enLPrincipiosPractica,
      'rey-peon': enLReyPeon,
      'tablas': enLTablas,
      'tablero': enLTablero,
      'torre-rey': enLTorreRey,
    },
    openings: {
      'e5-contra-e4': enOE5ContraE4,
      'espanola': enOEspanola,
      'espanola-cambio': enOEspanolaCambio,
      'esquema-gdr': enOEsquemaGdr,
      'fegatello': enOFegatello,
      'gambito-dama-rehusado': enOGambitoDamaRehusado,
      'italiana-tranquila': enOItalianaTranquila,
      'legal': enOLegal,
    },
  },
};
