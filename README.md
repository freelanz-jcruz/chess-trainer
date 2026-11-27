# Ajedrez Tutor

Aplicación web para aprender ajedrez desde cero, pensada para ratos sueltos en el móvil.
Libre (GPL-3), gratuita, sin cuentas y sin servidor: es un sitio estático, el motor de ajedrez corre
en tu navegador y el progreso se guarda solo en tu dispositivo.
La web publicada recoge estadísticas anónimas de visitas con [Umami](https://umami.is) (sin cookies ni datos personales); solo en el build de producción.

- **Temario en 7 bloques**: fundamentos, movimientos especiales, mates comunes, principios de apertura, repertorio, táctica y finales básicos.
- **Lecciones guiadas**: explicaciones breves, preguntas, ejercicios sobre el tablero y partidas contra Stockfish (mates básicos, rey y peón, oposición). Para el nivel intermedio: enfilada, desviación y rayos X, y los finales de torre de Lucena y Philidor.
- **Aperturas paso a paso**: recorrido con una frase breve por jugada y selector de variantes, y práctica en la que Stockfish valora cada jugada. Repertorio: Italiana con blancas; 1...e5 y el Gambito de Dama rehusado con negras; trampas Fegatello y Légal. Desde el nivel intermedio: la Española con blancas (Cerrada y del cambio) y más variantes, como el Gambito Evans, el Giuoco Piano con 5.d4 o el Gambito Marshall.
- **Ejercicios**: problemas de Lichess de mate en 1, mate en 2, pieza colgada, ataque doble, clavada y ataque a la descubierta; en niveles intermedio y avanzado, también mate en 3 y 4, mate en la última fila, enfilada, desviación, atracción, rayos X, interferencia y jugada tranquila.
- **Niveles** (principiante, intermedio, avanzado): el temario, las variantes y los ejercicios muestran el nivel elegido en Ajustes y los anteriores.
- **Repaso espaciado**: las aperturas practicadas y los problemas fallados vuelven a aparecer a intervalos crecientes (1, 3, 7, 14 y 30 días).
- **Exportar e importar el progreso** a un fichero, para no perderlo o pasarlo a otro dispositivo.
- **Funciona sin conexión** (PWA): se puede instalar en el móvil (Progreso → Ajustes → «Instalar la app») y, tras la primera visita, todo (incluido el motor) está disponible sin red.
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

Los iconos de `public/icons/` se generan desde `assets/icon.png` con `python3 tools/make-icons.py` (requiere Pillow). Incluye la versión para iOS (`icon-180`, opaca) y la adaptable de Android (`icon-maskable-512`), además de la marca de la cabecera (`public/brand-symbol.png`, desde `assets/symbol.png`).

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
3. Elige el modo (los dos recorren el fichero entero y tardan un buen rato) y después pasa `npm run validate`.

**Modo normal, principiante:** `npm run puzzles`

- Opciones y valores por defecto: `--per-theme 100 --min-rating 400 --max-rating 1400 --min-popularity 90 --min-plays 500 --max-rd 100`.
- Vuelve a elegir los problemas de principiante de los temas de `BEGINNER_THEMES`, en [`tools/filter-puzzles.ts`](tools/filter-puzzles.ts). Conserva tal cual los de niveles superiores (rating por encima de `--max-rating`).
- Cada problema va al primer tema de `PRIORITY` que tenga, y se reparten por igual en 4 franjas de rating.
- La elección es estable: con el mismo fichero y las mismas opciones sale exactamente lo mismo.
- Un tema nuevo se añade al final de `PRIORITY`, así los temas anteriores conservan sus problemas.
- Una base de Lichess más reciente o filtros distintos sí cambian los problemas. El progreso se guarda por id de problema, así que los resueltos que desaparezcan dejan de contar.

**Modo `--add`, niveles superiores:** `npm run puzzles -- --add [--per-set 60]`

- Rellena hasta `per-set` cada conjunto de nivel intermedio o avanzado de `content/curriculum.json`, con problemas de sus temas en el tramo de rating de su nivel (`LEVEL_RATING` en `lib/content/levels.ts`).
- Solo añade, al final del fichero: no cambia ni quita los que ya hay. Si un conjunto ya está completo, no lee la base de datos.
- Cada problema nuevo va a un solo conjunto, el primero del temario que lo acepte. Se aplican los mismos filtros de calidad y las mismas 4 franjas.
- Un conjunto muestra todos los problemas de sus temas y su tramo, no solo los que se le asignaron. Si un conjunto nuevo comparte temas y nivel con otro, puede contar ya con los suficientes y no recibir problemas propios.

### Añadir un conjunto de ejercicios al temario

1. Añade la lección al bloque que corresponda en `content/curriculum.json`, en la posición en la que debe aparecer:

   ```json
   { "id": "rayos-x", "title": "Rayos X", "type": "puzzles", "status": "available", "level": "avanzado", "themes": ["xRayAttack"] }
   ```

   - `id` es la URL (`/ejercicios/rayos-x/`).
   - `level` decide quién lo ve y de qué tramo de rating salen los problemas.
   - Varios `themes` se mezclan en el mismo conjunto.
   - Con `"status": "soon"` aparece como «próximamente» y no necesita problemas.
2. Si el tema de Lichess es nuevo, añádelo a `PUZZLE_THEMES` en `lib/content/schemas.ts`.
3. Intermedio o avanzado: ejecuta `npm run puzzles -- --add`.

   Principiante con un tema nuevo: añádelo a `BEGINNER_THEMES` y al final de `PRIORITY`, y ejecuta el modo normal. Si el tema ya existe, no hay nada que generar.
4. Ejecuta `npm run validate`. Falla si el conjunto no tiene problemas o si el nivel de una lección no coincide con el de su contenido, y avisa si tiene menos de 20.

La página del conjunto, su etiqueta en Ejercicios y su entrada en el sitemap se generan al compilar.

## Despliegue

Cada push a `main` lanza el workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): instala, comprueba tipos y tests, compila y sube `out/` al hosting con `lftp` (SFTP por defecto; también FTPS o FTP). También se puede lanzar a mano desde la pestaña **Actions → Despliegue → Run workflow**. Mientras falten los secrets, compila y pasa los tests pero no sube nada.

En GitHub → **Settings → Secrets and variables → Actions**:

| Tipo | Nombre | Valor |
|------|--------|-------|
| Secret | `DEPLOY_HOST` | Servidor, p. ej. `ftp.tudominio.es` |
| Secret | `DEPLOY_USER` | Usuario de SFTP/FTP |
| Secret | `DEPLOY_PASSWORD` | Contraseña |
| Secret | `DEPLOY_PATH` | Carpeta de la web en el servidor, p. ej. `/public_html` o `/www` |
| Secret (opcional) | `DEPLOY_KNOWN_HOSTS` | Huella del servidor SFTP: la salida de `ssh-keyscan -p PUERTO SERVIDOR`. Sin ella se acepta sin comprobar |
| Variable (opcional) | `DEPLOY_PROTOCOL` | `sftp` (por defecto), `ftps` (FTP con TLS explícito, puerto 21) o `ftp` (sin cifrar, solo si no hay otra) |
| Variable (opcional) | `DEPLOY_PORT` | Puerto, si no es el habitual (22 SFTP, 21 FTP) |
| Variable (opcional) | `DEPLOY_IP` | IP del servidor, cuando el hosting da una IP y su certificado FTPS lleva un nombre. Entonces `DEPLOY_HOST` es un nombre que cubra el certificado: se conecta a la IP y se comprueba el certificado con ese nombre. En Hostinger (certificado `*.hstgr.io`), p. ej. `ftp.hstgr.io` |
| Variable (opcional) | `DEPLOY_DELETE` | `true` para borrar en el servidor lo que ya no existe en `out/`. Solo si `DEPLOY_PATH` es una carpeta exclusiva de la app |

Las variables opcionales también valen creadas como secrets. Si el servidor FTPS presenta un certificado a nombre de otro servidor (habitual en hosting compartido), usa en `DEPLOY_HOST` el nombre que figura en el certificado y, si ese nombre no lleva a tu servidor, añade `DEPLOY_IP`. Para ver el certificado: `openssl s_client -starttls ftp -connect SERVIDOR:21 </dev/null 2>/dev/null | openssl x509 -noout -subject -text | grep -E "subject=|DNS:"`.

`sw.js` se sube el último, para que un móvil que lo reciba a mitad de la subida ya tenga en el servidor todo lo que precachea. La versión del pie muestra el commit desplegado.

**SEO:** la presentación está en `/info/` (con datos estructurados `WebApplication` y `FAQPage`), y al compilar se generan `robots.txt` y `sitemap.xml` con todas las lecciones, aperturas y ejercicios. Las URLs absolutas (sitemap, canónica, Open Graph) usan `https://ajedreztutor.com`; para otro dominio, compila con `SITE_URL=https://otro.dominio`.

Requisitos del servidor:

- **HTTPS**: sin él no funcionan el service worker (uso sin conexión) ni la instalación en el móvil.
- **Apache**: [`public/.htaccess`](public/.htaccess) se copia a `out/` y ya fuerza HTTPS, declara el tipo `application/wasm` (sin él no arranca el motor), sirve `sw.js` y las páginas con `Cache-Control: no-cache` (las versiones nuevas llegan pronto), guarda un año `_next/static/` (lleva hash en el nombre) y usa `404.html`. Supone la app en la raíz del dominio.
- **nginx u otro**: hay que configurar lo mismo en el servidor (tipo `.wasm`, `no-cache` para `sw.js`, HTML y `.txt`, y `404.html`).

## Contenido

Todo el contenido son datos en `content/`:

- `curriculum.json`: los 7 bloques del temario y sus lecciones.
- `openings/*.json`: aperturas (formato en [PLAN.md](PLAN.md#61-apertura-contentopeningsidjson)). Para añadir una, crea el JSON, regístralo en `lib/content/load.ts`, enlázalo en el temario (con su `level`, que debe coincidir con el del JSON) y pasa `npm run validate` y `npm run eco`. Las ramas (`branches`) son jugadas del rival: una jugada distinta de tu bando, como el cambio en la Española, va en una apertura aparte. Una rama puede llevar `level` para que solo la vea ese nivel y los superiores; sin él, hereda el de la rama que la contiene.
- `puzzles/puzzles.json`: generado por el script de filtrado (ver [Regenerar los ejercicios](#regenerar-los-ejercicios) y [Añadir un conjunto de ejercicios](#añadir-un-conjunto-de-ejercicios-al-temario)).
- `lessons/*.json`: lecciones guiadas (explicación, preguntas, ejercicios y juego contra Stockfish; formato en [PLAN.md](PLAN.md#64-lección-guiada-contentlessonsidjson)). Para añadir una, crea el JSON, impórtalo en `content/lessons/index.ts`, enlázalo en el temario con `"type": "lesson"` y pasa `npm run validate`.

Los textos de las lecciones son originales.

### Idiomas

La app está preparada para traducirse aunque de momento solo está en español (detalle en [PLAN.md](PLAN.md#13-idiomas-fase-9)):

- **Interfaz:** todos los textos están en `lib/i18n/es.ts`. En los componentes se leen con `useT()` y en las páginas con `getMessages()`; no hay textos en el código. Para un idioma nuevo: añadirlo a `lib/i18n/locales.ts`, crear su diccionario con el tipo `Messages` (TypeScript avisa de las claves que falten) y sus letras de las piezas en `lib/chess/notation.ts`.
- **Contenido:** `npm run i18n:template -- en` crea `content/i18n/en/` con un fichero de frases por lección y apertura más el temario, con cada texto original (`from`) y su traducción (`to`, vacía al principio). Se registran en `content/i18n/index.ts` y `npm run validate` avisa si una ruta ya no existe o si el original cambió después de traducirlo. Lo no traducido se muestra en español.

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
