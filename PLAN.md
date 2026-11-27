# Ajedrez Tutor — Plan

Aplicación web personal para aprender ajedrez desde cero, pensada para ratos sueltos en el móvil. Libre (GPL-3), gratuita, sin cuentas ni servidor.

> Estado: plan aprobado. **Fases 1 a 6 completadas** (salvo la publicación, pospuesta: irá a un hosting propio con dominio).

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
| Estilos | **Tailwind CSS v4** (fijado en 4.3.3: las versiones ≥ 4.3.4 exigen Node ≥ 22.12) + **shadcn/ui** (componentes copiados en `components/ui/`, sobre Radix, `class-variance-authority`, `clsx`, `tailwind-merge`, iconos `lucide-react`, animaciones `tw-animate-css`) | MIT | Diseño móvil primero. Configuración solo en CSS (`app/globals.css`, sin `tailwind.config`); `components.json` para la CLI de shadcn; `cn()` en `lib/utils.ts`. |
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
│   │   ├── notation.ts           # SAN inglesa -> letras de cada idioma (R, D, T, A, C en español)
│   │   └── game.ts               # utilidades sobre chess.js
│   ├── engine/
│   │   ├── engine-client.ts      # Cola de peticiones al Worker, promesas
│   │   ├── uci.ts                # Parser de "info ... score cp/mate ... pv"
│   │   └── evaluate.ts           # Cálculo de pérdida y clasificación
│   ├── i18n/                     # Idiomas de la interfaz (sección 13)
│   │   ├── locales.ts            # Idiomas disponibles
│   │   ├── es.ts                 # Diccionario de la interfaz en español
│   │   └── react.tsx             # I18nProvider, useT(), useSan()
│   ├── content/
│   │   ├── schemas.ts            # Esquemas zod (aperturas, problemas, temario)
│   │   ├── translations.ts       # Frases traducidas del contenido (sección 13)
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
| `play` | Partida contra Stockfish desde una posición hasta `checkmate` o `promote` en `maxMoves` jugadas. Con `strict`, cada jugada debe mantener un mate en las jugadas que quedan; sin `strict`, una jugada se deshace solo si deja escapar la victoria (después ya no hay mate a favor ni al menos +2). No se compara con la mejor jugada porque en los finales conocidos (rey y peón contra rey) Stockfish da cifras muy distintas a posiciones igual de ganadas. | Al ganar. |

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
  - `Themes` contiene al menos uno de `mateIn1`, `mateIn2`, `hangingPiece`, `fork`, `pin`, `discoveredAttack` (cada problema se asigna al primero de esa lista que tenga; los temas nuevos van al final para que los problemas ya elegidos no cambien).
- **Muestreo equilibrado:** ~100 por tema (≈ 600 en total), repartidos por tramos de rating, con semilla fija para que sea reproducible.
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
  "lessons": { "tablero": { "completed": true, "lastPage": 4 } },
  "reviews": {
    "opening:italiana-tranquila": { "box": 2, "due": "2026-11-25" },
    "puzzle:00sHx": { "box": 1, "due": "2026-11-23" }
  },
  "settings": { "engineTimeMs": 1000, "showCoordinates": true, "theme": "dark" }
}
```

Todo acceso envuelto en `try/catch` (modo privado o almacenamiento bloqueado → la app funciona sin guardar). Los datos antiguos sin `reviews` se leen con un repaso vacío.

**Repaso espaciado** (`lib/progress/review.ts`, cajas de Leitner): una apertura entra al terminar su primera práctica; un problema, cuando se falla (error, pista o rendirse; saltarlo sin jugar no cuenta). Acierto limpio → sube de caja y vuelve en 1, 3, 7, 14 o 30 días; fallo → caja 1, mañana. Un problema acertado en la última caja sale del repaso; las aperturas se quedan cada 30 días. Las fechas son días locales. La página `/repaso/` muestra las aperturas pendientes (enlace a su práctica) y una sesión con los problemas pendientes; el temario avisa y la cabecera muestra el número de repasos de hoy.

**Exportar / importar** (`/progreso/`): descarga `ajedrez-tutor-progreso-AAAA-MM-DD.json` (`{ app, exported, progress }`) e importa ese fichero tras validar el formato y pedir confirmación con un resumen de ambos progresos. La misma página permite cambiar los ajustes (tema, coordenadas y tiempo de análisis) y **borrar todo el progreso** (lecciones, aperturas, problemas y repasos; los ajustes se mantienen), tras una confirmación que recuerda exportar antes.

**Tema:** tres temas, definidos en `lib/theme.ts`: azul marino (`navy`, el de la marca y el de defecto), gris oscuro (`dark`, la base del CSS; el nombre se conserva por compatibilidad) y claro (`light`). Se eligen en Ajustes, o con el botón de la cabecera, que pasa al siguiente tema. El azul usa valoraciones algo más claras para mantener un contraste ≥ 4,5:1 sobre sus tarjetas, y un tema desconocido en un progreso importado vuelve al de defecto. Se guarda en `settings.theme` (viaja al exportar). Un script en línea en `<head>` (`components/ThemeScript.tsx`) lo aplica antes de pintar, para evitar el destello del tema equivocado; el CSS define el oscuro en `:root` y el claro en `:root[data-theme="light"]`.

**Estilos (Tailwind + shadcn):** la paleta usa los nombres de variables de shadcn (`--background`, `--foreground`, `--card`, `--primary`, `--muted-foreground`, `--border`, `--destructive`…) más las propias del ajedrez (`--sq-light`, `--sq-dark`, `--ok`, `--good`, `--inacc`, `--mistake`, `--blunder`); `@theme inline` las expone como utilidades (`bg-card`, `text-muted-foreground`, `border-l-blunder`…). La variante `dark:` se aplica cuando no hay `data-theme="light"`, y `trainer:` a partir de 820 px (tablero y panel en dos columnas). Capas de `app/globals.css`, de menor a mayor prioridad: `reset` (preflight de Tailwind, por debajo de Chessground, que necesita su propio `box-sizing` y `padding`) → `vendor` (CSS de Chessground) → `theme` → `base` (cuerpo, `h1`, `h2`, enlaces) → `components` (lo que no admite clases: colores del tablero y elementos que crea Chessground, y `.prose` para el texto de lecciones y créditos) → `utilities`. Todo lo demás se escribe con clases de Tailwind en los componentes; no queda CSS propio por pantallas. Piezas compartidas: `components/Trainer.tsx` (`Trainer`, `Panel`, `Controls`, `Note`), `components/Callout.tsx` (recuadro con borde de color según la valoración), `components/Chip.tsx` y `components/ui/badge.tsx`.

**Navegación** (`components/SiteNav.tsx`): en escritorio (≥ 768 px), cabecera con la marca, los enlaces (Temario, Repaso con el número de pendientes, Ejercicios, Progreso; el activo resaltado) y el conmutador de tema. En móvil, la cabecera solo lleva la marca y el conmutador, y los enlaces pasan a una **barra de pestañas fija abajo** con iconos (lucide). Su alto está en `--tabbar-h` (0 en escritorio): el `body`, la barra inferior de las lecciones y el aviso de actualización dejan ese hueco. `viewport-fit=cover` + `env(safe-area-inset-bottom)` para el indicador de inicio del iPhone. Temario queda activo también en lecciones y aperturas.

**Componentes shadcn** (`components/ui/`): Button, AlertDialog, Label, RadioGroup, Switch, Select y Sonner (Toaster), sobre `radix-ui` y `sonner`. En `/progreso/`, importar y borrar piden confirmación con AlertDialog (en vez de `window.confirm`) y los resultados se avisan con toasts; los ajustes usan RadioGroup (tema), Switch (coordenadas) y Select (tiempo de análisis). Los avisos de la PWA («Hay una versión nueva · Actualizar», «Lista para usar sin conexión») también son toasts de Sonner, **arriba**, para no tapar el tablero ni la barra de pestañas.

**Instalar la app** (Ajustes → «Instalar la app», `lib/install.ts` + `components/InstallApp.tsx`): en Android y Chrome/Edge de escritorio se guarda el evento `beforeinstallprompt` (se escucha desde la primera página, importado en `ServiceWorker.tsx`) y el botón «Instalar» abre el diálogo del navegador. En iPhone/iPad Safari no lo permite: el botón «Cómo hacerlo» explica los pasos (Compartir → «Añadir a pantalla de inicio» → «Añadir»). Si la app ya se abre instalada (modo standalone) muestra «Instalada»; en navegadores sin instalación la fila no aparece. El navegador solo ofrece instalar con HTTPS o en localhost, así que con `npm run dev` por la IP de la red local no aparece en Android.

**Presentación y bienvenida:** `/info` es la presentación de la app (landing de una sola página, indexable, con datos estructurados; `robots.txt` y `sitemap.xml` se generan al compilar). La primera vez que se entra en el temario aparece un aviso «¿Primera vez por aquí?» (`components/WelcomeBanner.tsx`) con «Conocer la app» (→ `/info`) e «Instalar»; se cierra con ×. No es una ventana ni una redirección: así no interrumpe a quien llega a una lección desde un buscador o un enlace, ni Google lo toma por una ventana intrusiva. La ventana con icono, versión y commit sigue en Créditos → «Acerca de Ajedrez Tutor».

**Hoja inferior en móvil** (`components/PanelExtras.tsx`, Drawer de shadcn sobre `vaul`): lo secundario del panel de un entrenador (lista de jugadas, línea elegida, estadísticas de práctica) se muestra tal cual con tablero y panel en dos columnas (≥ 820 px); por debajo queda tras un botón «Jugadas · n» que abre una hoja deslizable desde abajo, con un velo suave para que el tablero siga viéndose al tocar una jugada. Se usa en el recorrido y la práctica de aperturas; en problemas y lecciones el panel ya es corto y todo lo que muestra es necesario para jugar.

**Botones Anterior/Siguiente de las lecciones:** en móvil van fijos abajo (sobre la barra de pestañas); con tablero y panel en dos columnas van al final del panel, para no tapar la parte baja del tablero en pantallas poco altas. En las partidas contra Stockfish de las lecciones, el texto de la pista solo aparece al pulsar «Pista». **Enunciado arriba en móvil:** con una columna, el texto que explica la página (lecciones, nota de cada jugada del recorrido, «Juegan las…: encuentra la mejor jugada» de los ejercicios) va encima del tablero, igual que el selector de variantes del recorrido y el mensaje de cada jugada (valoración, «Tu turno», «¡Conseguido!») en lecciones, ejercicios y práctica de aperturas; la valoración y los botones, debajo. Se consigue con `Statement` (`components/Trainer.tsx`) y un `Panel` que en móvil es `display: contents`; en dos columnas todo sigue en el panel de la derecha. **Preguntas en móvil:** en las preguntas con tablero, las opciones no se muestran en la página sino tras un botón «Ver respuestas» que abre un panel lateral derecho (Drawer con `side="right"`), con el enunciado repetido arriba; así el tablero queda justo bajo el enunciado. Al elegir, el panel se cierra y el resultado sale en una ventana modal centrada en la pantalla, con fondo oscurecido y la página bloqueada mientras está abierta («Entendido» / «Probar otra vez» vuelve a abrir el panel; también se cierra tocando fuera o con Esc). Al cerrar un acierto, la explicación queda debajo de las opciones. En dos columnas el resultado sigue en el panel. En la práctica de aperturas, la primera vez se juega la línea principal y las siguientes, ramas al azar desde la primera práctica de cada visita.

---

## 11. Fases posteriores

| Fase | Contenido |
|------|-----------|
| **0** | Este plan. |
| **1** | Prototipo (sección 3). |
| **2** ✅ | **PWA sin conexión con Serwist**: precache de toda la exportación estática (páginas, `.txt` de navegación de Next, JS/CSS, motor `.js` + `.wasm`, iconos), manifiesto e icono propio, aviso «Hay una versión nueva · Actualizar» (la versión nueva no se activa sola a mitad de un ejercicio) y página 404 de respaldo sin conexión. Como Next 16 compila con Turbopack y el plugin de `@serwist/next` es de webpack, el service worker (`sw/sw.ts`) se compila con esbuild y `@serwist/build` inyecta la lista de precache sobre `out/` en `postbuild` (`tools/build-sw.mjs`). Admite `BASE_PATH` para publicar en un subdirectorio. |
| **3** ✅ | Bloques 1–3 con el tipo de lección `lesson` (páginas `text`, `quiz`, `move`, `drill` y `play`; sección 6.4): 13 lecciones de fundamentos, movimientos especiales y mates comunes, selector de coronación en el tablero, progreso por lección y validación de todo el contenido con Stockfish. |
| **4** ✅ | Bloques 4–5: principios de apertura y repertorio completo (Italiana con más variantes del rival, 1...e5 contra las principales respuestas de las blancas, Gambito de Dama rehusado, trampas). Comprobación de nombres/ECO contra el catálogo `lichess-org/chess-openings` (CC0). Hecho: lecciones «Los cinco principios» y «Aplica los principios»; aperturas 1...e5 (12 líneas: Italiana, 2.Dh5, Vienesa, Gambito de Rey, Centro, Española con la variante del cambio, Escocesa, Cuatro Caballos…), Gambito de Dama rehusado (6 líneas: Colle, Londres, Catalana, cambio…), esquema del GDR contra 1.Cf3 y 1.c4 (7 líneas), rama de los Dos Caballos en la Italiana y trampas Fegatello y Légal; selector de variantes en el recorrido y `npm run eco`. |
| **5** ✅ | Bloques 6–7: más temas tácticos (`pin`, `discoveredAttack`: 96 y 100 problemas nuevos; los 400 anteriores se mantienen), finales de rey y peón (regla del cuadrado, rey delante del peón, peón de torre) y oposición (tomarla, desbordar y defender), con partidas contra Stockfish hasta coronar. |
| **6** ✅ | Repaso espaciado de aperturas y problemas fallados y exportar/importar progreso (sección 10), con página de ajustes. Repositorio público en GitHub (GPL-3) hecho. **Pospuesto:** el despliegue; en lugar de GitHub Pages irá a un hosting propio con dominio (es un sitio estático: basta con subir `out/`, y `BASE_PATH` sirve si va en un subdirectorio). |
| **7** | **Niveles superiores.** Por partes: **7a** ✅ ajuste «Nivel» en Ajustes (principiante, intermedio, avanzado; por defecto principiante) que filtra el temario y las variantes de las aperturas (se muestra el nivel elegido y los anteriores; una rama sin `level` hereda el de la que la contiene; `lib/content/levels.ts`); las lecciones de nivel superior llevan su etiqueta y cada bloque indica cuántas quedan ocultas, con enlace para cambiar el nivel. Los enlaces directos y el repaso no se filtran. **7b** ✅ ejercicios por nivel: cada conjunto del temario usa el tramo de rating de su nivel (principiante hasta 1400, los 596 de siempre; intermedio 1401–1900; avanzado desde 1901; `LEVEL_RATING`). 11 conjuntos nuevos de 60 problemas (660 en total): intermedio, Mate en 3, Mate en la última fila, Enfilada, Desviación, Atracción y Táctica intermedia; avanzado, Mates en 3 y 4, Rayos X, Interferencia, Jugada tranquila y Táctica avanzada. `npm run puzzles -- --add` añade los de los conjuntos de nivel superior del temario sin tocar los existentes. Los temas de Ejercicios se filtran por nivel y «Todos» se limita al nivel elegido. **7c** ✅ aperturas: **Española con blancas** (intermedio; Cerrada con la Chigorin, y como ramas la Berlinesa con 4.d3 y la Abierta; avanzado, el Gambito Marshall y la Breyer) y **Española del cambio** aparte (intermedio; las ramas son solo jugadas del rival, así que una elección propia como 4.Axc6 va en su propia apertura). Con negras, en 1...e5: Gambito Evans (4.b4) y Giuoco Piano con 5.d4 (intermedio), con 6.e5 y el ataque Møller (avanzado). En el Gambito de Dama rehusado: 5.Axf6, 7.Ad3 y 4.Cf3 con 5.e3 (intermedio), y el plan Cge2 y f3 en el cambio (avanzado). Todo validado con Stockfish y `npm run eco`. **7d** ✅ lecciones de nivel intermedio: «Enfilada, desviación y rayos X» (bloque 6; las posiciones de práctica son problemas sencillos de Lichess que no están en Ejercicios) y «Finales de torre: Lucena y Philidor» (bloque 7: construir el puente, contra Stockfish incluido, y la defensa con la torre en la sexta fila). Cada respuesta se comprobó con Stockfish jugada a jugada. El validador comprueba que el nivel de cada lección del temario coincida con el de su contenido. |
| **8** | **Partida libre contra Stockfish** (petición de jugadores con experiencia). Nueva sección «Jugar» con partidas completas desde la posición inicial; detalle en la sección 12. Por partes: **8a** partida con niveles, elección de color, reglas completas, abandonar, guardar la partida en curso y exportar PGN; **8b** revisión al terminar, con la valoración de cada jugada propia y salto a los errores; **8c** opcionales: modo entrenamiento (aviso antes de un error grave), deshacer, reloj e historial de partidas. |
| **9** | **Idiomas: inglés** (y otros más adelante). Interfaz y contenido traducidos, español en la raíz e inglés en `/en/`, notación con las letras de cada idioma y elección automática según el navegador con selector en Ajustes; detalle en la sección 13. Se puede posponer hasta confirmar el interés (Umami); el mejor momento para la base técnica es entre las fases 7 y 8. |

---

## 12. Partida libre contra Stockfish (fase 8)

**Viabilidad: alta.** Casi todo existe ya: tablero con coronación, reglas con chess.js (mate, ahogado, triple repetición, 50 jugadas, material insuficiente), Stockfish en un Web Worker, la valoración de jugadas de los ejercicios (`evaluateMove`) y partidas contra el motor en las lecciones (`PlayPageView`). Sigue siendo estático y sin conexión: no hace falta servidor.

**Lo que hay que construir:**

- **Niveles de juego.** Stockfish tiene `Skill Level` (0–20) y `UCI_LimitStrength` + `UCI_Elo`, pero el mínimo de `UCI_Elo` es 1320 y `Skill Level 0` sigue siendo demasiado fuerte para quien empieza. Para los niveles bajos, el motor analiza varias candidatas (`MultiPV`) y elige al azar entre las que no pierden más de un margen que depende del nivel, con errores más probables cuanto más bajo; para los altos, `UCI_Elo`. Unos 6–8 niveles, de «Principiante» a «Fuerte». Hay que calibrarlos jugando.
- **Motor compartido.** El envoltorio (`lib/engine/engine.ts`) fija `MultiPV 1` al arrancar y lo comparte con la valoración de jugadas. Cada análisis llevará sus opciones (`setoption` antes de `position`), restableciendo las de valoración, para no crear un segundo worker (memoria en el móvil).
- **Página «Jugar»** (quinta pestaña en móvil): ajustes de partida (color: blancas, negras o al azar; nivel), tablero, lista de jugadas (`PanelExtras`), botones «Abandonar» y «Nueva partida», y resultado en la ventana modal de siempre (`ResultDialog`) con el motivo (mate, ahogado, repetición…).
- **Partida en curso guardada** en el progreso (FEN inicial + jugadas), para seguirla si se cierra la app; sin romper el progreso ya guardado (la carga actual completa los campos que falten).
- **Exportar PGN** (copiar o descargar), para analizarla en Lichess u otra herramienta.
- **Revisión (8b):** al terminar, se valoran las jugadas propias con el clasificador actual (correcta, imprecisión, error, error grave) y se muestran un resumen y la lista de errores, con salto a cada posición y la mejor jugada como flecha. Se analiza jugada a jugada en segundo plano y con barra de progreso; en el móvil puede llevar un minuto en partidas largas.
- **Opcionales (8c):** modo entrenamiento (si la jugada es un error grave, avisa y deja repetirla), deshacer jugada, reloj (no es prioritario para principiantes), tablas por acuerdo (el motor acepta si la valoración está igualada), historial de partidas y estadísticas por nivel con sugerencia de subir de nivel.

**Riesgos:** calibrar niveles que fallen de forma creíble (no regalar piezas al azar a cada jugada); consumo de batería con análisis largos en el móvil (tiempos cortos para el rival y la revisión, a petición); y que la quinta pestaña quepa bien en pantallas estrechas.

**Orden:** se puede hacer antes que la fase 7 sin problema, porque no dependen una de otra. La 8a sola ya responde a la petición.

---

## 13. Idiomas (fase 9)

**Motivo:** empieza a llegar tráfico de fuera de España; el inglés es el que más público abre.

**Viabilidad: alta, con un coste repartido entre la base técnica y la traducción.** Medido sobre el proyecto actual: unas 7.000 palabras de contenido (18 lecciones y 6 aperturas) y unos 250–400 textos de interfaz repartidos por los componentes. Sigue siendo un sitio estático y sin conexión.

**Cómo hacerlo:**

- **Direcciones:** el español sigue en la raíz (no cambian las direcciones actuales ni las apps ya instaladas) y el inglés va en `/en/`. Con la exportación estática no hay middleware ni redirecciones del servidor de Next: dos *root layouts* con grupos de rutas (`app/(es)/…` con `<html lang="es">` y `app/en/…` con `lang="en"`), y las páginas de `/en/` son envoltorios finos que reutilizan los mismos componentes con el idioma como dato.
- **Textos de interfaz:** un diccionario tipado por idioma (`lib/i18n/es.ts`, `en.ts`) y un contexto de React con el idioma. TypeScript obliga a que los dos tengan las mismas claves, así que no se escapa un texto sin traducir. No hace falta una librería (next-intl y similares encajan peor con la exportación estática).
- **Contenido:** las jugadas, posiciones y soluciones no se duplican. Cada lección y apertura tiene un fichero de frases por idioma (`content/i18n/en/lessons/piezas.json`…) con la ruta de cada texto, el original y la traducción, y `npm run validate` avisa de rutas que no existen y de traducciones cuyo original ha cambiado.
- **Notación:** las letras de las piezas dependen del idioma (R, D, T, A, C en español; K, Q, R, B, N en inglés). Los nombres de aperturas en inglés salen del catálogo de Lichess que ya se usa para los códigos ECO.
- **Elección del idioma:** la primera vez, si el navegador no está en español, se propone cambiar a `/en/`. Hay un selector en Ajustes y un enlace en el pie, y la elección se guarda en el dispositivo. Se añaden `hreflang` en el HTML para los buscadores.
- **Lo demás:** manifiesto con nombre y descripción por idioma; el progreso es el mismo en los dos idiomas; el service worker precachea solo las páginas del idioma elegido; Umami separa las visitas por ruta.

### 13.1 Base técnica (hecha)

Lo que permite traducir la app:

- **Interfaz:** todos los textos están en `lib/i18n/es.ts`, como frases completas (los plurales y los datos van como parámetros, nunca montados por piezas). Los componentes de cliente los leen con `useT()` (contexto `I18nProvider` en el layout) y los de servidor (páginas, metadatos, manifiesto) con `getMessages(locale)`. Las frases con negrita usan `**…**` (componente `Bold`) y las que llevan un enlace u otro elemento, huecos `{nombre}` (componente `Fill`). También están ahí el idioma de las fechas (`intlLocale`) y el `og:locale`.
- **Notación:** `formatSan` y `formatMoveList` (`lib/chess/notation.ts`) reciben el idioma; en los componentes, `useSan()`.
- **Contenido:** `lib/content/translations.ts` define los ficheros de frases (`content/i18n/<idioma>/…`, cada entrada `{ from, to }` por ruta), `content/i18n/index.ts` los registra y `curriculumIn`, `lessonIn` y `openingIn` (`lib/content/load.ts`) devuelven el contenido traducido, con el español donde falte o esté desfasado. `npm run i18n:template -- en` crea o completa los ficheros con todas las frases por traducir; `npm run validate` los comprueba.
- **Fuera de la interfaz:** los mensajes del validador y de las herramientas siguen en español (son para quien edita el contenido).

### 13.2 Inglés (hecho)

- **Direcciones:** el español sigue en la raíz y el inglés en `/en/`, con los segmentos traducidos (`lib/i18n/routes.ts`: `/en/lessons/<id>/`, `/en/openings/<id>/practice/`, `/en/puzzles/<id>/`, `/en/review/`, `/en/progress/`, `/en/about/`, `/en/credits/`). Los ids son los mismos en los dos idiomas (también son las claves del progreso). Los enlaces internos se montan con `routeHref(locale, route)` o, en los componentes, `useHref()`; nunca a mano.
- **Páginas:** cada página es un módulo compartido en `components/pages/` que recibe el idioma; `app/(es)/…` y `app/en/…` son envoltorios finos con su *root layout* (`<html lang>`). La 404 (`app/global-not-found.tsx`) es bilingüe.
- **Contenido:** las 1.038 frases de lecciones, aperturas y temario están en `content/i18n/en/` (traducidas con IA; conviene que las revise alguien que juegue y hable inglés). Notación inglesa (K, Q, R, B, N y O-O).
- **Elección del idioma:** sin redirección automática. Si el navegador está en otro idioma de la app, un aviso (escrito en ese idioma) ofrece cambiar. Hay un selector en Ajustes y un enlace en el pie. La elección se guarda en el dispositivo (`chess-trainer:lang`, aparte del progreso) y, si existe, la portada del otro idioma lleva a la elegida, para que la app instalada la respete.
- **SEO:** canónica y `hreflang` en cada página (`x-default`: español), sitemap con alternativas, `og:locale` y `og:locale:alternate`; robots excluye progreso y repaso en los dos idiomas.
- **Manifiesto:** uno por idioma (`/manifest.webmanifest` y `/en/manifest.webmanifest`) con el mismo `id`, así que es la misma app instalada; cambia la portada de inicio.
- **Sin conexión:** el service worker se registra con el idioma (`/sw.js?lang=en`) y precachea solo las páginas de ese idioma más lo común (unos 11,5 MB en lugar de 20). Las del otro idioma se guardan al visitarlas. Al cambiar de idioma se reinstala y se activa solo, sin el aviso de nueva versión.
- **Otro idioma:** añadirlo a `locales.ts`, su diccionario, sus segmentos en `routes.ts`, sus letras en `notation.ts`, sus ficheros de frases (`npm run i18n:template -- xx`), los envoltorios de `app/xx/` y su manifiesto; y generalizar el filtro de `sw/sw.ts`, que hoy distingue solo español e inglés.

**Al hacer pantallas nuevas:** ningún texto en el código, todo en `es.ts`; frases completas con parámetros; notación siempre con `useSan()`.

**Traducción:** la interfaz es mecánica. El contenido conviene traducirlo con ayuda de IA y que lo revise alguien que juegue y hable inglés, porque el vocabulario de ajedrez tiene sus giros (*fork*, *pin*, *skewer*, *zugzwang*…).

**Orden:** posponerlo no cierra puertas (las direcciones actuales no cambian y traducir el contenido cuesta lo mismo antes que después), pero cada pantalla nueva con textos en el código y cada frase montada por piezas añade trabajo de migración. Se puede esperar a confirmar en Umami que las visitas de fuera son personas. Si se pospone, el mejor momento para la base técnica es **entre las fases 7 y 8**: la 7 es sobre todo contenido en JSON y la 8 mucha interfaz nueva, que conviene hacer ya preparada para varios idiomas. Una vez montado, añadir otro idioma (portugués, francés…) es solo traducir.

---

## 14. Licencias y créditos

- Código: **GPL-3.0** (compatible con Chessground y Stockfish, ambos GPL-3).
- Problemas de ajedrez y catálogo de aperturas: **Lichess, CC0** (dominio público). Se acredita en el README y en `/creditos` por cortesía, sin usar la marca ni el diseño de Lichess.
- Stockfish (GPL-3), Chessground (GPL-3), chess.js (BSD-2), set de piezas (licencia libre, se acredita).
- Textos y notas: originales.

---

## 15. Riesgos y decisiones abiertas

- **Rendimiento del motor en móvil:** la variante *lite* de un hilo es más lenta; se compensa empezando a analizar mientras el usuario piensa y con tiempo de análisis ajustable.
- **Tamaño de descarga:** el `.wasm` *lite* pesa unos MB; se carga solo al entrar en un modo que lo necesite.
- **Variabilidad del motor:** con poco tiempo, dos análisis pueden discrepar ligeramente; los umbrales están pensados para tolerarlo, y las jugadas del libro nunca dependen del motor (son "correctas" por definición, y el validador garantiza que no son errores).
- **Respuesta a 1.c4 (Inglesa) y 1.Cf3 (Réti):** *decidido*: el esquema del Gambito de Dama rehusado (sección 2.1).
- **Línea exacta de la Italiana:** la propuesta hasta 9.h3 se confirmará con el validador antes de cerrarla.
