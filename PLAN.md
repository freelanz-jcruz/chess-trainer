# Chess Trainer — Plan

Aplicación web personal para aprender ajedrez desde cero, pensada para ratos sueltos en el móvil. Libre (GPL-3), gratuita, sin cuentas ni servidor.

> Estado: plan aprobado. **Fases 1, 2, 3 y 4 completadas.**

---

## 1. Visión y principios

- **Para principiantes absolutos.** Sesiones cortas (2–10 min), una idea por pantalla.
- **La app no explica en profundidad.** Indica si una jugada es correcta o recomendable según Stockfish y, como mucho, da una frase breve de principio general. El porqué detallado queda para la bibliografía.
- **Todo el contenido es dato.** El motor de lecciones es genérico; añadir una apertura, un mate o un final significa añadir un JSON, no programar.
- **Estático y local.** Sitio exportado (`output: 'export'`), motor de ajedrez en el navegador, progreso en `localStorage` y funcionamiento sin conexión (PWA).
- **Textos originales.** Nunca copiados de libros. Nombres de aperturas y datos de problemas procedentes de Lichess (CC0), sin usar su marca ni su diseño.
- **Notación en español en pantalla** (R, D, T, A, C; 0-0, 0-0-0). Internamente se usa SAN inglesa (la que entiende `chess.js`) y se traduce solo al mostrar.

---

## 2. Temario completo (7 bloques)

| # | Bloque | Contenido | Tipo de lección previsto |
|---|--------|-----------|--------------------------|
| 1 | **Fundamentos** | El tablero y las piezas; cómo mueve cada una; captura; valor de las piezas; jaque; jaque mate; ahogado y tablas (repetición, material insuficiente, 50 jugadas) | Explicación con posiciones + tareas ("lleva el caballo a e5", "captura la pieza sin defensa") |
| 2 | **Movimientos especiales** | Enroque (corto/largo y cuándo no se puede); captura al paso; coronación | Explicación + tareas |
| 3 | **Mates comunes** | Mate del pastor y cómo evitarlo; mate del pasillo; mate de la coz; dama + rey contra rey; torre + rey contra rey | Tareas de mate en N + práctica contra Stockfish |
| 4 | **Principios de apertura** | Controlar el centro, desarrollar piezas menores, enrocar pronto, no mover la dama demasiado pronto, no mover dos veces la misma pieza sin motivo | Explicación breve + ejercicios "elige la jugada que cumple el principio" |
| 5 | **Repertorio** | Blancas: **Italiana** (tranquila). Negras contra 1.e4: **1...e5**, lo que obliga a saber responder a lo que juegan las blancas después (ver 2.1). Negras contra 1.d4: **Gambito de Dama rehusado** (...d5, ...e6, ...Cf6, ...Ae7, ...0-0). Trampas típicas: **mate del pastor**, **Fegatello** (ataque Fried Liver), **mate de Légal** | Modo apertura (recorrido + práctica valorada) |

### 2.1 Qué cubre el repertorio y qué no

Un repertorio de principiante tiene que ser **mínimo**: una apertura con blancas y una respuesta por cada primera jugada habitual del rival. Por eso con blancas solo está la Italiana: la **Española (Ruy López)** o la **Inglesa** no hacen falta para *jugar* con blancas.

Sí hay que saber **defenderse** de ellas:

| Con negras te puedes encontrar | Respuesta del repertorio | Fase |
|--------------------------------|--------------------------|------|
| 1.e4 e5 2.Cf3 Cc6 3.Ac4 (**Italiana**) | 3...Ac5, la misma estructura que ya conoces con blancas | 4 |
| 1.e4 e5 2.Cf3 Cc6 3.Ab5 (**Española**) | 3...a6 (defensa Morphy) con ...Cf6, ...Ae7, ...b5, ...d6 y 0-0: una línea principal sencilla | 4 |
| 1.e4 e5 2.Cf3 Cc6 3.d4 (**Escocesa**) | 3...exd4 4.Cxd4 Cf6 o Ac5 | 4 |
| 1.e4 e5 2.Cc3 / 2.Cf3 Cc6 3.Cc3 (**Vienesa, Cuatro Caballos**) | Desarrollo natural con ...Cf6 y ...Ab4/...Ac5 | 4 |
| 1.e4 e5 2.f4 (**Gambito de Rey**) y otras raras | Una línea segura de pocas jugadas | 4–5 |
| 1.d4 d5 2.c4 (**Gambito de Dama**) | Gambito de Dama rehusado | 4 |
| 1.c4 (**Inglesa**) / 1.Cf3 (**Réti**) | Esquema del Gambito de Dama rehusado: ...d5, ...e6, ...Cf6, ...Ae7, ...0-0. A menudo se llega a la misma posición, y si no, se reconoce la estructura | 4 |

Todas siguen el mismo formato de apertura (6.1) con `"side": "black"`; no hace falta programar nada nuevo.
| 6 | **Táctica** | Pieza colgada; ataque doble; clavada; descubierta | Problemas de Lichess filtrados por tema |
| 7 | **Finales básicos** | Rey y peón contra rey; la oposición | Tareas + práctica contra Stockfish |

---

## 3. Alcance del prototipo (fase 1)

Demostración técnica, no temario completo:

1. **Modo apertura con una sola apertura: la Italiana tranquila (Giuoco Pianissimo)**
   `1.e4 e5 2.Cf3 Cc6 3.Ac4 Ac5 4.c3 Cf6 5.d3 d6 6.0-0 0-0 7.Te1 a6 8.Ab3 Aa7 9.h3`
   (línea exacta a confirmar con el validador y el catálogo de Lichess).
   - **Recorrido:** paso a paso, adelante/atrás, con una frase breve de principio general por jugada.
   - **Práctica:** el usuario juega con blancas; la app responde con las jugadas del libro; cada jugada del usuario se valora.
2. **Modo ejercicio** con unos cientos de problemas de Lichess (temas `mateIn1`, `mateIn2`, `hangingPiece`, `fork`; rating ~400–1400; popularidad alta).
3. **Valoración** de cada jugada con Stockfish (tabla de la sección 7) y **botón de pista** con flecha.
4. **Progreso** en `localStorage`.
5. **Validador** de contenido (`npm run validate`).
6. README con créditos (Lichess CC0, Stockfish, Chessground, chess.js) y licencia GPL-3.

**Terminado =** `npm run build` genera la exportación estática en `out/`, la app arranca en local (`npx serve out`), se puede recorrer y jugar la Italiana y resolver ejercicios con valoración.

Fuera del prototipo: PWA, resto de bloques, repaso espaciado, partidas libres contra el motor.

---

## 4. Stack técnico

| Pieza | Elección | Licencia | Notas |
|-------|----------|----------|-------|
| Framework | **Next.js** (última estable, App Router) + **TypeScript** | MIT | `output: 'export'`, `images.unoptimized`, sin rutas API ni middleware. Rutas dinámicas con `generateStaticParams`. |
| Tablero | **Chessground** | GPL-3 | Compatible con nuestra GPL-3. Envuelto en un componente cliente propio. Colores del tablero propios (no los de Lichess). Piezas: set *cburnett* (licencia libre; se acredita) u otro libre. |
| Reglas | **chess.js** | BSD-2 | Legalidad, SAN, FEN, detección de mate/ahogado. |
| Motor | **Stockfish WASM, un solo hilo** (paquete npm `stockfish`, variante *lite-single*) | GPL-3 | Copiado a `public/engine/` por un script `postinstall`/`prebuild`. Se ejecuta en un **Web Worker**. Al ser de un hilo no necesita `SharedArrayBuffer`, así que **no hacen falta cabeceras COOP/COEP** (vale para GitHub Pages o cualquier hosting estático). |
| Validación de datos | **zod** | MIT | Esquemas compartidos entre app y scripts. |
| Estilos | CSS Modules (o Tailwind si se prefiere) | — | Diseño móvil primero. |
| Tests | **Vitest** | MIT | Lógica pura: valoración, traducción de notación, parser UCI, progreso. |
| Scripts | **tsx** para ejecutar TypeScript en `tools/` | MIT | |
| PWA (fase 2) | **Serwist** (`serwist` + `@serwist/build`) y **esbuild** | MIT | Ver sección 11. |

---

## 5. Estructura de carpetas

```
chess-trainer/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                  # Inicio: temario con progreso
│   ├── aperturas/
│   │   └── [id]/
│   │       ├── page.tsx          # Recorrido paso a paso
│   │       └── practica/page.tsx # Práctica valorada
│   ├── ejercicios/
│   │   └── page.tsx              # Problemas (filtro por tema)
│   └── creditos/page.tsx
├── components/
│   ├── board/Board.tsx           # Envoltorio de Chessground (cliente)
│   ├── MoveFeedback.tsx          # Etiqueta de valoración
│   └── HintButton.tsx
├── lib/
│   ├── chess/
│   │   ├── notation-es.ts        # SAN inglesa -> española
│   │   └── game.ts               # utilidades sobre chess.js
│   ├── engine/
│   │   ├── engine-client.ts      # Cola de peticiones al Worker, promesas
│   │   ├── uci.ts                # Parser de "info ... score cp/mate ... pv"
│   │   └── evaluate.ts           # Cálculo de pérdida y clasificación
│   ├── content/
│   │   ├── schemas.ts            # Esquemas zod (aperturas, problemas, temario)
│   │   └── load.ts               # Carga tipada de /content
│   └── progress/
│       └── store.ts              # localStorage versionado
├── content/                      # TODO el contenido como datos
│   ├── curriculum.json           # Bloques y lecciones (con estado: disponible / próximamente)
│   ├── openings/
│   │   └── italiana-tranquila.json
│   └── puzzles/
│       └── puzzles.json          # Generado por tools/filter-puzzles.ts (se versiona)
├── public/
│   └── engine/                   # stockfish-*.js + .wasm (copiados, no versionados)
├── tools/
│   ├── copy-engine.mjs           # Copia Stockfish de node_modules a public/engine
│   ├── filter-puzzles.ts         # Filtra el CSV de Lichess
│   └── validate-content.ts       # Validador
├── tests/                        # Vitest
├── LICENSE                       # GPL-3.0
├── README.md
└── PLAN.md
```

---

## 6. Formato de datos

### 6.1 Apertura (`content/openings/<id>.json`)

```json
{
  "id": "italiana-tranquila",
  "name": "Apertura Italiana: Giuoco Pianissimo",
  "eco": "C54",
  "side": "white",
  "block": 5,
  "level": "principiante",
  "summary": "Desarrollo tranquilo y sólido: piezas fuera, enroque y preparar d4 más adelante.",
  "startFen": "startpos",
  "steps": [
    { "san": "e4",   "note": "Ocupa el centro y abre paso al alfil y a la dama." },
    { "san": "e5",   "note": "Las negras también reclaman el centro." },
    { "san": "Nf3",  "note": "Desarrolla una pieza atacando un peón." },
    { "san": "Nc6",  "note": "Defiende el peón desarrollando." },
    { "san": "Bc4",  "note": "El alfil apunta a f7, la casilla débil de las negras." },
    { "san": "Bc5",  "note": "Las negras copian la idea." },
    { "san": "c3",   "note": "Prepara d4 para ganar espacio en el centro." },
    { "san": "Nf6",  "note": "Otra pieza desarrollada, presionando e4." },
    { "san": "d3",   "note": "Defiende e4 con calma: aquí está la versión tranquila." }
    // ...
  ],
  "alternatives": {
    "6": ["d3"]
  }
}
```

- `san`: SAN inglesa (estándar de `chess.js`). La app la muestra en español.
- `note`: frase breve, original, de principio general (≤ 140 caracteres; lo comprueba el validador). Las jugadas del rival pueden no llevar nota.
- `side`: bando que aprende el usuario; la app juega automáticamente el otro bando en la práctica.
- `alternatives` (opcional): índice de paso (desde 0) → jugadas del libro también aceptadas como "correctas" (p. ej. `4.d3` en lugar de `4.c3`, que transpone). En el prototipo puede ir vacío.
- (El `// ...` del ejemplo es solo ilustrativo; los ficheros reales son JSON puro.)
- Las trampas (Fegatello, Légal) usan el mismo formato con `"kind": "trap"`: la línea incluye el error del rival y cómo aprovecharlo. La defensa contra el mate del pastor está en la lección del bloque 3 y como rama de 1...e5 (2.Dh5).
- `eco` (opcional) en la apertura y en cada rama; `npm run eco` lo comprueba contra el catálogo de Lichess.

#### Variantes (preparado desde la fase 1)

Aperturas como la Española tienen muchas ramas según lo que juegue el rival. Para no tener que cambiar el formato más adelante, cada paso puede llevar **ramas** opcionales: líneas alternativas del rival que parten de ese punto.

```json
{
  "san": "a6", "note": "Pregunta al alfil qué quiere hacer.",
  "branches": [
    { "id": "cambio", "name": "Variante del cambio", "level": "intermedio",
      "steps": [ { "san": "Bxc6", "note": "..." }, { "san": "dxc6", "note": "..." } ] }
  ]
}
```

- La línea principal sigue siendo `steps`; cada rama es otra lista de pasos, que a su vez puede tener ramas (un árbol).
- En el recorrido, al llegar a un punto con ramas aparece un selector («Aquí la partida puede seguir de varias formas») para elegir cuál seguir, también en ramas anidadas. En la práctica, cada vez que se empieza de nuevo la app elige al azar una rama en cada punto, para entrenarlas todas; al terminar muestra qué línea se ha jugado.
- El validador recorre el árbol entero: legalidad y valoración en todas las ramas.
- En la fase 1 la Italiana no lleva ramas, pero el código ya las admite, con un test que lo comprueba.

### 6.2 Problema (`content/puzzles/puzzles.json`)

Generado a partir del CSV de Lichess. Columnas originales: `PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags`.

> ⚠️ En el CSV, `FEN` es la posición **antes** de la primera jugada de `Moves`, y esa primera jugada es **la del rival**. El usuario juega a partir de la segunda. Las jugadas están en UCI (`e2e4`, `e7e8q`).

Formato almacenado (compacto, conserva la semántica original para no equivocarse):

```json
{
  "source": "Lichess puzzle database (CC0)",
  "generated": "2026-11-21",
  "puzzles": [
    {
      "id": "00sHx",
      "fen": "q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17",
      "opponentMove": "e8d7",
      "solution": ["a2e6", "d7d8", "f7f8"],
      "rating": 1050,
      "themes": ["mateIn2", "short"]
    }
  ]
}
```

- Flujo en la app: se carga `fen`, se anima `opponentMove` (~0,6 s) y el usuario juega `solution[0]`; la app responde con `solution[1]`, el usuario juega `solution[2]`, etc.
- Convención de Lichess que se respeta: **en problemas de mate, cualquier jugada que dé mate en la última jugada se acepta como correcta.**

### 6.3 Temario (`content/curriculum.json`)

```json
{
  "blocks": [
    {
      "id": 5, "title": "Repertorio",
      "lessons": [
        { "id": "italiana-tranquila", "type": "opening", "ref": "openings/italiana-tranquila.json", "status": "available" },
        { "id": "gambito-dama-rehusado", "type": "opening", "status": "soon" }
      ]
    },
    {
      "id": 6, "title": "Táctica",
      "lessons": [
        { "id": "colgada", "type": "puzzles", "themes": ["hangingPiece"], "status": "available" },
        { "id": "ataque-doble", "type": "puzzles", "themes": ["fork"], "status": "available" }
      ]
    }
  ]
}
```

Tipos de lección: `opening` (práctica de una apertura), `puzzles` (problemas filtrados por tema) y `lesson` (lección guiada por páginas, desde la fase 3; ver 6.4). Los tipos `explanation`, `task` y `vsEngine` previstos al principio se unificaron en `lesson`, porque una misma lección mezcla explicación, ejercicios y juego contra el motor.

### 6.4 Lección guiada (`content/lessons/<id>.json`)

```json
{ "id": "torre-rey", "title": "Mate con torre y rey", "block": "mates", "level": "principiante",
  "summary": "…", "pages": [ { "kind": "text", "body": "…" }, … ] }
```

Cada página tiene un `kind`:

| `kind` | Qué hace | Se completa |
|--------|----------|-------------|
| `text` | Texto (párrafos, **negrita**, listas con «- ») y tablero opcional con flechas, casillas resaltadas o los movimientos de una pieza (`showMovesFrom`). | Al visitarla. |
| `quiz` | Pregunta con 2–4 opciones (`answer` es el índice correcto) y explicación breve opcional. | Al acertar. |
| `move` | Una jugada sobre una posición; opcionalmente el rival mueve antes (`opponentMove`, UCI). `goal`: `listed` (una de las jugadas de `accept`, en SAN), `good` (Stockfish la considera buena) o `mate` (debe dar mate). | Con una jugada válida; las incorrectas se deshacen. |
| `drill` | Posición sin reyes: llevar una pieza a una casilla (`reach`) o capturarlo todo (`captureAll`). `par` es el mínimo de jugadas. | Al cumplir el objetivo. |
| `play` | Partida contra Stockfish desde una posición hasta `checkmate` o `promote` en `maxMoves` jugadas. Con `strict`, cada jugada debe mantener un mate en las jugadas que quedan. | Al ganar. |

El progreso de cada lección (`completed`, `lastPage`) se guarda en `localStorage` y la lección se retoma donde se dejó. Para añadir una lección: crea el JSON, impórtalo en `content/lessons/index.ts`, enlázalo en `curriculum.json` (`"type": "lesson", "ref": "<id>"`) y pasa `npm run validate`, que comprueba FEN, legalidad de las jugadas, que exista el mate, que el `par` de los ejercicios sea el mínimo (búsqueda en anchura) y que las partidas contra el motor sean ganables (Stockfish).

---

## 7. Valoración de jugadas

### 7.1 Cálculo

1. Cuando le toca al usuario, el motor **empieza a analizar en segundo plano** la posición actual → mejor jugada y evaluación `E_mejor` (desde el punto de vista del que mueve).
2. El usuario juega `m`. Si `m` es la jugada esperada (libro o solución), se clasifica directamente como **correcta** sin esperar al motor.
3. Si no, se analiza la posición resultante → `E_tras` (se cambia el signo para verlo desde el que movió).
4. `pérdida = max(0, E_mejor − E_tras)` en peones.
5. Las evaluaciones de mate se convierten a un valor grande (`±(100 − n)` peones) y las evaluaciones normales se acotan a ±15 peones para que en posiciones ganadas no aparezcan pérdidas ficticias.
6. Si tras `m` el rival tiene **mate forzado** (y antes no lo tenía) → error grave, sea cual sea la pérdida numérica.

Profundidad: tiempo fijo (~0,8–1,5 s, ajustable) o `depth 14`, lo que ocurra antes; suficiente para un principiante y asumible en móvil.

### 7.2 Tabla

| Situación | Etiqueta | Color |
|-----------|----------|-------|
| Jugada esperada (libro / solución / cualquier mate en problema de mate) | ✅ **Correcta** | verde |
| Pérdida < 0,5 peones | 👍 **Buena alternativa** | verde claro |
| 0,5 ≤ pérdida < 1 | ⚠️ **Imprecisión** | amarillo |
| 1 ≤ pérdida ≤ 3 | ❌ **Error** | naranja |
| Pérdida > 3, o permite mate | ⛔ **Error grave** | rojo |

Comportamiento según el modo:
- **Apertura (práctica):** si no es la jugada del libro, se muestra la valoración y se deshace la jugada para que lo intente de nuevo. Si es "buena alternativa", se dice que es jugable pero que en esta apertura se juega otra.
- **Ejercicio:** solo cuenta como resuelto si se encuentra la solución (o un mate alternativo). Cualquier otra jugada se valora, se deshace y se puede reintentar. Resolver sin fallos ni pista = "a la primera".

### 7.3 Pista

Botón **Pista** → flecha en el tablero (`drawable.autoShapes` de Chessground) con la jugada recomendada: la del libro en aperturas, la de la solución en ejercicios y la mejor de Stockfish en modos libres. Usar la pista queda registrado en el progreso.

---

## 8. Script de filtrado de problemas (`tools/filter-puzzles.ts`)

- **Entrada:** `lichess_db_puzzle.csv.zst` descargado a mano desde la base de datos de Lichess (no se versiona; carpeta ignorada `tools/data/`).
- **Lectura en streaming** (el fichero tiene millones de filas): descompresión `zstd` (CLI del sistema o paquete `fzstd`) → lector CSV línea a línea.
- **Filtros** (configurables por argumentos):
  - `Rating` entre 400 y 1400.
  - `Popularity` ≥ 90 y `NbPlays` ≥ 500 (calidad contrastada).
  - `RatingDeviation` ≤ 100 (rating fiable).
  - `Themes` contiene al menos uno de `mateIn1`, `mateIn2`, `hangingPiece`, `fork`.
- **Muestreo equilibrado:** ~100 por tema (≈ 400 en total), repartidos por tramos de rating, con semilla fija para que sea reproducible.
- **Transformación:** `Moves` se separa en `opponentMove` + `solution`; se descartan `GameUrl` y `OpeningTags`.
- **Comprobación:** cada jugada se reproduce con `chess.js`; si alguna es ilegal, se descarta el problema y se avisa.
- **Salida:** `content/puzzles/puzzles.json` (se versiona; unos cientos de KB).
- Uso: `npm run puzzles -- --input tools/data/lichess_db_puzzle.csv.zst --per-theme 100`

---

## 9. Validador de contenido (`npm run validate`)

`tools/validate-content.ts`, ejecutado con Stockfish en Node (mismo paquete npm):

1. **Esquemas:** todos los JSON de `content/` cumplen los esquemas zod.
2. **Temario:** cada lección `available` apunta a un fichero existente; ids únicos.
3. **Aperturas:**
   - Cada jugada es **legal** desde la posición anterior.
   - Para cada jugada del bando que aprende el usuario, Stockfish (profundidad 16) calcula la pérdida respecto a la mejor jugada. **Falla** si alguna es *error* o *error grave* (≥ 1 peón); **avisa** si es *imprecisión*. Las jugadas dudosas del rival (2.Dh5, 2.f4…) solo se informan: es lo que juega la gente.
   - Trampas (`kind: "trap"`): en cada línea el rival comete al menos una imprecisión, y el usuario acaba con mate o con al menos +0,7 (el Fegatello no gana material a la fuerza: deja al rey negro en el centro, unos +0,8).
   - Notas ≤ 140 caracteres.
4. **Problemas:** esquema, jugadas legales, y (opcional, con `--deep`) que la primera jugada de la solución sea la mejor según Stockfish.
5. Salida legible y código de salida ≠ 0 si hay errores (apto para CI más adelante).

Las evaluaciones del validador se cachean en `tools/.cache/` para no recalcular en cada ejecución.

**Nombres y ECO (`npm run eco`, `tools/check-eco.ts`):** descarga una vez el catálogo `lichess-org/chess-openings` (CC0) en `tools/data/`, reconoce las posiciones de cada línea (también por transposición) y comprueba que el ECO declarado en la apertura y en cada rama coincide con la posición más profunda del catálogo.

---

## 10. Progreso (`localStorage`)

Clave única `chess-trainer:v1`, objeto versionado con migraciones:

```json
{
  "version": 1,
  "openings": {
    "italiana-tranquila": { "walkthroughDone": true, "practiceRuns": 4, "cleanRuns": 2, "lastPlayed": "2026-11-21" }
  },
  "puzzles": {
    "00sHx": { "solved": true, "firstTry": false, "attempts": 2, "hintUsed": false, "lastSeen": "2026-11-21" }
  },
  "settings": { "engineTimeMs": 1000, "showCoordinates": true }
}
```

Todo acceso envuelto en `try/catch` (modo privado o almacenamiento bloqueado → la app funciona sin guardar). Más adelante: exportar/importar el progreso a un fichero JSON.

---

## 11. Fases posteriores

| Fase | Contenido |
|------|-----------|
| **0** | Este plan. |
| **1** | Prototipo (sección 3). |
| **2** ✅ | **PWA sin conexión con Serwist**: precache de toda la exportación estática (páginas, `.txt` de navegación de Next, JS/CSS, motor `.js` + `.wasm`, iconos), manifiesto e icono propio, aviso «Hay una versión nueva · Actualizar» (la versión nueva no se activa sola a mitad de un ejercicio) y página 404 de respaldo sin conexión. Como Next 16 compila con Turbopack y el plugin de `@serwist/next` es de webpack, el service worker (`sw/sw.ts`) se compila con esbuild y `@serwist/build` inyecta la lista de precache sobre `out/` en `postbuild` (`tools/build-sw.mjs`). Admite `BASE_PATH` para publicar en un subdirectorio. |
| **3** ✅ | Bloques 1–3 con el tipo de lección `lesson` (páginas `text`, `quiz`, `move`, `drill` y `play`; sección 6.4): 13 lecciones de fundamentos, movimientos especiales y mates comunes, selector de coronación en el tablero, progreso por lección y validación de todo el contenido con Stockfish. |
| **4** ✅ | Bloques 4–5: principios de apertura y repertorio completo (Italiana con más variantes del rival, 1...e5 contra las principales respuestas de las blancas, Gambito de Dama rehusado, trampas). Comprobación de nombres/ECO contra el catálogo `lichess-org/chess-openings` (CC0). Hecho: lecciones «Los cinco principios» y «Aplica los principios»; aperturas 1...e5 (12 líneas: Italiana, 2.Dh5, Vienesa, Gambito de Rey, Centro, Española con la variante del cambio, Escocesa, Cuatro Caballos…), Gambito de Dama rehusado (6 líneas: Colle, Londres, Catalana, cambio…), esquema del GDR contra 1.Cf3 y 1.c4 (7 líneas), rama de los Dos Caballos en la Italiana y trampas Fegatello y Légal; selector de variantes en el recorrido y `npm run eco`. |
| **5** | Bloques 6–7: más temas tácticos (`pin`, `discoveredAttack`), finales de rey y peón y oposición (lecciones con páginas `drill`, `move` y `play`). |
| **6** | Repaso espaciado de aperturas y problemas fallados, exportar/importar progreso, publicación en GitHub (repositorio público, GPL-3) y despliegue en GitHub Pages. |
| **7+** | **Niveles superiores.** Cada lección y cada rama lleva un campo `level` (`principiante`, `intermedio`, `avanzado`), y la app muestra solo el nivel elegido y los anteriores. Repertorio ampliado como datos: **Española con blancas** y sus variantes principales (Cerrada, del Cambio, Berlinesa, Abierta, Marshall como defensa), más variantes de la Italiana (Evans, 4.d4) y del Gambito de Dama. Problemas de rating más alto y más temas tácticos con el mismo script de filtrado. |

---

## 12. Licencias y créditos

- Código: **GPL-3.0** (compatible con Chessground y Stockfish, ambos GPL-3).
- Problemas de ajedrez y catálogo de aperturas: **Lichess, CC0** (dominio público). Se acredita en el README y en `/creditos` por cortesía, sin usar la marca ni el diseño de Lichess.
- Stockfish (GPL-3), Chessground (GPL-3), chess.js (BSD-2), set de piezas (licencia libre, se acredita).
- Textos y notas: originales.

---

## 13. Riesgos y decisiones abiertas

- **Rendimiento del motor en móvil:** la variante *lite* de un hilo es más lenta; se compensa empezando a analizar mientras el usuario piensa y con tiempo de análisis ajustable.
- **Tamaño de descarga:** el `.wasm` *lite* pesa unos MB; se carga solo al entrar en un modo que lo necesite.
- **Variabilidad del motor:** con poco tiempo, dos análisis pueden discrepar ligeramente; los umbrales están pensados para tolerarlo, y las jugadas del libro nunca dependen del motor (son "correctas" por definición, y el validador garantiza que no son errores).
- **Respuesta a 1.c4 (Inglesa) y 1.Cf3 (Réti):** *decidido*: el esquema del Gambito de Dama rehusado (sección 2.1).
- **Línea exacta de la Italiana:** la propuesta hasta 9.h3 se confirmará con el validador antes de cerrarla.
