// Registro de lecciones. Añadir una lección = crear su JSON, importarlo aquí y enlazarla en curriculum.json.
import tablero from './tablero.json';
import piezas from './piezas.json';
import captura_valor from './captura-valor.json';
import jaque_mate from './jaque-mate.json';
import tablas from './tablas.json';
import enroque from './enroque.json';
import al_paso from './al-paso.json';
import coronacion from './coronacion.json';
import mate_pastor from './mate-pastor.json';
import mate_pasillo from './mate-pasillo.json';
import mate_coz from './mate-coz.json';
import dama_rey from './dama-rey.json';
import torre_rey from './torre-rey.json';
import principios from './principios.json';
import principios_practica from './principios-practica.json';
import rey_peon from './rey-peon.json';
import oposicion from './oposicion.json';
import enfilada_desviacion from './enfilada-desviacion.json';
import lucena_philidor from './lucena-philidor.json';

export const LESSON_FILES: unknown[] = [tablero, piezas, captura_valor, jaque_mate, tablas, enroque, al_paso, coronacion, mate_pastor, mate_pasillo, mate_coz, dama_rey, torre_rey, principios, principios_practica, rey_peon, oposicion, enfilada_desviacion, lucena_philidor];
