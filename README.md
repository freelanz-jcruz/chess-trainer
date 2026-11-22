# Chess Trainer

Aplicación web para aprender ajedrez desde cero, pensada para ratos sueltos en el móvil.
Libre (GPL-3), gratuita, sin cuentas y sin servidor: es un sitio estático, el motor de ajedrez corre
en tu navegador y el progreso se guarda solo en tu dispositivo.

- **Temario en 7 bloques**: fundamentos, movimientos especiales, mates comunes, principios de apertura, repertorio, táctica y finales básicos.
- **Lecciones guiadas**: explicaciones breves, preguntas, ejercicios sobre el tablero y partidas contra Stockfish (mates básicos, rey y peón, oposición).
- **Aperturas paso a paso**: recorrido con una frase breve por jugada y selector de variantes, y práctica en la que Stockfish valora cada jugada. Repertorio: Italiana con blancas; 1...e5 y el Gambito de Dama rehusado con negras; trampas Fegatello y Légal.
- **Ejercicios**: problemas de Lichess de mate en 1, mate en 2, pieza colgada, ataque doble, clavada y ataque a la descubierta.
- **Repaso espaciado**: las aperturas practicadas y los problemas fallados vuelven a aparecer a intervalos crecientes (1, 3, 7, 14 y 30 días).
- **Exportar e importar el progreso** a un fichero, para no perderlo o pasarlo a otro dispositivo.
- **Funciona sin conexión** (PWA): se puede instalar en el móvil y, tras la primera visita, todo (incluido el motor) está disponible sin red.
- **Valoración** de cada jugada según la pérdida respecto a la mejor (correcta, buena alternativa, imprecisión, error, error grave) y **pista** con flecha.

La app no explica en profundidad por qué una jugada es mejor que otra: indica si es correcta según el motor. El plan completo está en [PLAN.md](PLAN.md).

## Uso

Requisitos: Node.js ≥ 20.9.

```bash
npm install        # instala dependencias y copia Stockfish a public/engine
npm run dev        # desarrollo en http://localhost:3000
npm run build      # exportación estática en out/ (+ service worker out/sw.js)
npm start          # sirve out/ en http://localhost:4321
```

El service worker solo se registra en el build de producción (`npm run build` + `npm start`), no en `npm run dev`.
Para publicar en un subdirectorio (p. ej. GitHub Pages en `/chess-trainer`), compila con `BASE_PATH=/chess-trainer npm run build`.

Los iconos de `public/icons/` se generan desde `assets/icon.svg` con `tools/make-icons.sh` (macOS).

Otros scripts:

| Script | Qué hace |
|--------|----------|
| `npm test` | Tests de la lógica (Vitest) |
| `npm run lint` | Comprobación de tipos |
| `npm run validate` | Valida el contenido: esquemas, legalidad de las jugadas y, con Stockfish, que ninguna jugada de tu bando en las aperturas sea un error y que las trampas funcionen. Opciones: `--depth 20`, `--deep` (comprueba también los problemas), `--no-cache` |
| `npm run eco` | Comprueba los códigos ECO de las aperturas contra el catálogo de Lichess (lo descarga la primera vez) |
| `npm run puzzles` | Regenera `content/puzzles/puzzles.json` desde la base de datos de Lichess (ver abajo) |

### Regenerar los ejercicios

1. Descarga `lichess_db_puzzle.csv.zst` desde <https://database.lichess.org/#puzzles> en `tools/data/` (≈ 300 MB, no se versiona).
2. Ten instalado `zstd` (`brew install zstd` o `apt install zstd`).
3. `npm run puzzles -- --per-theme 100` (filtros por defecto: rating 400–1400, popularidad ≥ 90, ≥ 500 partidas, desviación ≤ 100).

## Contenido

Todo el contenido son datos en `content/`:

- `curriculum.json`: los 7 bloques del temario y sus lecciones.
- `openings/*.json`: aperturas (formato en [PLAN.md](PLAN.md#61-apertura-contentopeningsidjson)). Para añadir una, crea el JSON, regístralo en `lib/content/load.ts`, enlázalo en el temario y pasa `npm run validate` y `npm run eco`.
- `puzzles/puzzles.json`: generado por el script de filtrado.
- `lessons/*.json`: lecciones guiadas (explicación, preguntas, ejercicios y juego contra Stockfish; formato en [PLAN.md](PLAN.md#64-lección-guiada-contentlessonsidjson)). Para añadir una, crea el JSON, impórtalo en `content/lessons/index.ts`, enlázalo en el temario con `"type": "lesson"` y pasa `npm run validate`.

Los textos de las lecciones son originales.

## Créditos

- **Problemas**: [base de datos de problemas de Lichess](https://database.lichess.org/#puzzles), publicada bajo **CC0** (dominio público). Gracias a Lichess y a su comunidad. Este proyecto no está afiliado a Lichess ni usa su marca.
- **Nombres de aperturas**: catálogo [lichess-org/chess-openings](https://github.com/lichess-org/chess-openings) (CC0).
- **Motor**: [Stockfish](https://stockfishchess.org/) (GPL-3), compilado a WebAssembly por [stockfish.js](https://github.com/nmrugg/stockfish.js) (variante *lite* de un solo hilo).
- **Tablero**: [Chessground](https://github.com/lichess-org/chessground) (GPL-3), con las piezas *cburnett* de Colin M. L. Burnett (GPL/BSD/GFDL).
- **Reglas**: [chess.js](https://github.com/jhlywa/chess.js) (BSD-2).
- [Next.js](https://nextjs.org/) y [React](https://react.dev/) (MIT).
- [Serwist](https://serwist.pages.dev/) (MIT) para el funcionamiento sin conexión.

## Licencia

[GNU General Public License v3.0 o posterior](LICENSE).
