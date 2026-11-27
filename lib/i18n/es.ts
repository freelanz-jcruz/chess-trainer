import type { Level } from '@/lib/content/schemas';
import type { Verdict } from '@/lib/engine/evaluate';
import type { Theme } from '@/lib/theme';

/**
 * Textos de la interfaz en español. Las frases van completas (con parámetros cuando hace falta), nunca
 * montadas por piezas, para que cada idioma pueda ordenarlas a su manera. Los contenidos (lecciones,
 * aperturas, temario) no van aquí: están en content/.
 */
export const es = {
  appName: 'Ajedrez Tutor',

  level: { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' } satisfies Record<Level, string>,

  theme: {
    names: { navy: 'Azul marino', dark: 'Gris oscuro', light: 'Claro' } satisfies Record<Theme, string>,
    switchTo: (name: string) => `Cambiar a tema ${name.toLowerCase()}`,
    title: (name: string) => `Tema ${name.toLowerCase()}`,
  },

  verdict: {
    correct: 'Correcta',
    good: 'Buena alternativa',
    inaccuracy: 'Imprecisión',
    mistake: 'Error',
    blunder: 'Error grave',
  } satisfies Record<Verdict, string>,

  feedback: {
    thinking: 'Analizando…',
    allowsMate: 'permite mate',
    missesMate: 'deja escapar el mate',
    lossTitle: 'Peones perdidos respecto a la mejor jugada',
  },

  moveList: { label: 'Jugadas' },

  curriculum: {
    soon: 'próximamente',
    openingPracticed: (n: number) => `practicada ${n}×`,
    openingSeen: 'vista',
    lessonCompleted: 'completada ✓',
    lessonStarted: 'empezada',
    hiddenByLevel: (n: number) => (n === 1 ? 'Una lección más en niveles superiores' : `${n} lecciones más en niveles superiores`),
    changeLevel: 'cambiar el nivel',
  },
  progress: {
    loading: 'Cargando…',
    summary: (lessons: number, puzzles: number, openings: number, reviews: number) =>
      `${lessons === 1 ? '1 lección completada' : `${lessons} lecciones completadas`}, ` +
      `${puzzles === 1 ? '1 problema resuelto' : `${puzzles} problemas resueltos`}, ` +
      `${openings === 1 ? '1 apertura practicada' : `${openings} aperturas practicadas`} y ` +
      `${reviews === 1 ? '1 elemento' : `${reviews} elementos`} en el repaso`,
    exportFileName: (day: string) => `ajedrez-tutor-progreso-${day}.json`,
    exported: 'Progreso exportado',
    exportedDetail: 'Guarda el fichero donde quieras.',
    notAProgressFile: 'Ese fichero no es un progreso de Ajedrez Tutor.',
    imported: 'Progreso importado',
    deleted: 'Progreso borrado',
    deletedDetail: 'Puedes empezar de cero.',
    title: 'Tu progreso',
    intro: (summary: string) =>
      `El progreso solo se guarda en este navegador: ${summary}. Para no perderlo o pasarlo a otro dispositivo, expórtalo a un fichero y luego impórtalo donde quieras.`,
    export: 'Exportar progreso',
    import: 'Importar progreso…',
    importTitle: '¿Importar este progreso?',
    importHas: (summary: string) => `**El fichero tiene:** ${summary}.`,
    importReplaces: (summary: string) => `**Sustituirá tu progreso actual** en este dispositivo: ${summary}.`,
    cancel: 'Cancelar',
    importConfirm: 'Importar',
    deleteIntro: 'Borrar el progreso elimina lecciones, aperturas, problemas y repasos. Los ajustes se mantienen.',
    delete: 'Borrar todo el progreso…',
    deleteTitle: '¿Borrar todo el progreso?',
    deleteWhat: (summary: string) => `Se borrará todo tu progreso en este dispositivo: ${summary}.`,
    deleteWarning: 'Tus ajustes se mantienen. **No se puede deshacer**: si quieres conservar una copia, exporta antes el progreso.',
    deleteConfirm: 'Borrar todo',
  },

  settings: {
    title: 'Ajustes',
    level: 'Nivel',
    levelHelp: 'El temario, las variantes de las aperturas y los ejercicios muestran tu nivel y los anteriores.',
    theme: 'Tema',
    themeHelp: 'Azul marino, gris oscuro o claro; también desde el botón de la cabecera.',
    coordinates: 'Coordenadas',
    coordinatesHelp: 'Letras y números de filas y columnas en el borde del tablero.',
    engineTime: 'Tiempo de análisis',
    engineTimeHelp: 'Lo que piensa Stockfish cada jugada: más tiempo, valoraciones más precisas.',
    engineFast: '0,5 s (rápido)',
    engineMedium: '1 s',
    enginePrecise: '2 s (preciso)',
    install: 'Instalar la app',
  },

  common: {
    hint: 'Pista',
    restart: 'Empezar de nuevo',
    moves: 'Jugadas',
    movesCount: (n: number) => `Jugadas · ${n}`,
    again: 'Otra vez',
    next: 'Siguiente',
    previous: 'Anterior',
    close: 'Cerrar',
    continue: 'Continuar',
    understood: 'Entendido',
    tryAgain: 'Inténtalo de nuevo.',
  },

  openingPractice: {
    start: 'Te toca. Juega la primera jugada de la apertura.',
    doneClean: (trap: boolean) => (trap ? '¡Trampa completada sin fallos!' : '¡Apertura completada sin fallos!'),
    doneWith: (trap: boolean, errors: number, hints: number) =>
      `${trap ? 'Trampa completada' : 'Apertura completada'} con ${errors === 1 ? '1 fallo' : `${errors} fallos`} y ${hints === 1 ? '1 pista' : `${hints} pistas`}.`,
    alternative: (bookMove: string) => `También se juega, pero en esta línea seguimos con ${bookMove}.`,
    playableButNotBook: 'Es jugable, pero en esta apertura se juega otra cosa. Inténtalo de nuevo.',
    arrowShown: 'Te marco la jugada de la apertura con una flecha.',
    runs: (runs: number, clean: number) => `Prácticas completadas: ${runs} · sin fallos: ${clean}`,
    line: (names: string[]) => `Línea: ${names.length ? names.join(' › ') : 'principal'}`,
    reviewWalkthrough: 'Repasar el recorrido',
  },

  walkthrough: {
    intro: (summary: string) => `${summary} Pulsa «Siguiente» para empezar.`,
    toStart: 'Al principio',
    branchesHere: 'Aquí la partida puede seguir de varias formas:',
    mainLine: (move: string) => `${move} · principal`,
    lineMoves: 'Jugadas de la línea',
    movesProgress: (index: number, total: number) => `Jugadas · ${index}/${total}`,
    tapMove: 'Toca una jugada para verla en el tablero.',
    seenAll: 'Has visto toda la línea.',
    practiceNow: 'Practicar ahora',
  },

  puzzles: {
    skippedLeft: (n: number) =>
      n === 1
        ? 'Has saltado el problema que quedaba: seguirá pendiente.'
        : `Has saltado los ${n} problemas que quedaban: seguirán pendientes.`,
    reviewDone: 'No quedan problemas por repasar hoy. ¡Bien hecho!',
    none: 'No hay ejercicios.',
    loading: 'Cargando ejercicios…',
    headerReview: (title: string, due: number, rating: number) => `${title} · quedan ${due} hoy · dificultad ${rating}`,
    headerSet: (title: string, solved: number, total: number, rating: number) =>
      `${title} · resueltos ${solved}/${total} · dificultad ${rating}`,
    watchOpponent: 'Mira la jugada del rival…',
    yourTurn: 'Tu turno.',
    solved: '¡Resuelto!',
    keepGoing: 'Sigue…',
    notBad: 'No está mal, pero hay algo mejor. Inténtalo de nuevo.',
    prompt: (white: boolean) => `Juegan las ${white ? 'blancas' : 'negras'}: encuentra la mejor jugada.`,
    skip: 'Saltar',
    source: 'Problema {link} de la base de datos de Lichess (CC0).',
    solvedSummary: (errors: number, hint: boolean) => {
      if (!errors && !hint) return 'A la primera y sin pistas.';
      const fails = errors === 1 ? '1 fallo' : `${errors} fallos`;
      if (errors && hint) return `Resuelto con ${fails} y pista.`;
      return `Resuelto con ${errors ? fails : 'pista'}.`;
    },
  },

  lesson: {
    kind: { text: 'Explicación', quiz: 'Pregunta', move: 'Tu turno', drill: 'Ejercicio', play: 'Contra Stockfish' },
    pagesLabel: (page: number, total: number) => `Página ${page} de ${total}`,
    pageDot: (page: number, kind: string) => `Página ${page}: ${kind}`,
    completed: '¡Lección completada!',
    finishedLesson: (title: string) => `Has terminado «${title}».`,
    backToCurriculum: 'Volver al temario',
    nextLesson: 'Siguiente lección',
    correct: '¡Correcto!',
    achieved: '¡Conseguido!',
    wellDone: '¡Bien hecho!',
    yourTurn: 'Tu turno.',
    watchOpponent: 'Mira la jugada del rival…',
    repeat: 'Repetir',
    // Jugada
    notThatMove: 'No es la jugada que buscamos. Prueba otra vez.',
    notMate: 'Eso no es mate. Prueba otra vez.',
    somethingBetter: 'Hay algo mejor. Prueba otra vez.',
    // Contra Stockfish
    goal: (checkmate: boolean, maxMoves?: number) => {
      const goal = checkmate ? 'Da mate' : 'Corona un peón';
      if (!maxMoves) return `${goal}.`;
      return `${goal} en ${maxMoves === 1 ? '1 jugada' : `${maxMoves} jugadas`} como mucho.`;
    },
    achievedIn: (n: number) => `¡Conseguido en ${n === 1 ? '1 jugada' : `${n} jugadas`}!`,
    stalemate: '¡Ahogado! El rey rival no está en jaque pero no puede mover: son tablas. Prueba otra jugada.',
    noMateIn: (n: number) => `Así no hay mate en ${n}. Prueba otra vez.`,
    winSlips: 'Así se escapa la victoria. Prueba otra vez.',
    outOfMoves: 'Se acabaron las jugadas. ¡Inténtalo de nuevo!',
    movesSoFar: (n: number, max?: number) => (max ? `Jugadas: ${n} de ${max}` : `Jugadas: ${n}`),
    wonSummary: (checkmate: boolean, n: number) =>
      `${checkmate ? 'Mate' : 'Peón coronado'} en ${n === 1 ? '1 jugada' : `${n} jugadas`}.`,
    outOfMovesTitle: 'Se acabaron las jugadas',
    notAchievedIn: (n: number) => `No lo has conseguido en ${n === 1 ? '1 jugada' : `${n} jugadas`}. ¡Inténtalo de nuevo!`,
    // Ejercicio de movimiento
    drillStart: (par?: number) => (par ? `Tu turno. Objetivo: ${par === 1 ? '1 jugada' : `${par} jugadas`}.` : 'Tu turno.'),
    drillDone: (n: number, perfect: boolean) =>
      `¡Conseguido en ${n === 1 ? '1 jugada' : `${n} jugadas`}!${perfect ? ' Es lo mínimo posible.' : ''}`,
    drillCanDoBetter: (n: number, par: number) => `¡Conseguido en ${n} jugadas! Se puede en ${par}: ¿lo intentas otra vez?`,
    drillProgress: (n: number, par?: number) => (par ? `Jugadas: ${n} · objetivo: ${par}` : `Jugadas: ${n}`),
    drillSummary: (n: number, par?: number) => `En ${n === 1 ? '1 jugada' : `${n} jugadas`}${par ? ': es lo mínimo posible.' : '.'}`,
    drillSummaryBetter: (n: number, par: number) => `En ${n} jugadas. Se puede en ${par}: ¿lo intentas otra vez?`,
    tryAgainButton: 'Intentarlo otra vez',
    // Pregunta
    wrongAnswer: 'No es esa. Prueba otra vez.',
    wrongTitle: 'No es esa',
    tryAnother: 'Probar otra vez',
    seeAnswersAgain: 'Ver las respuestas',
    seeAnswers: 'Ver respuestas',
    answers: 'Respuestas',
  },

  /** Idioma para fechas y números (Intl). */
  intlLocale: 'es-ES',

  nav: {
    label: 'Principal',
    curriculum: 'Temario',
    review: 'Repaso',
    puzzles: 'Ejercicios',
    progress: 'Progreso',
    pending: (n: number) => `${n} pendientes`,
  },

  review: {
    loading: 'Cargando…',
    intro: (lastDays: number) =>
      `Repasar lo aprendido a intervalos cada vez más largos ayuda a no olvidarlo. Las aperturas entran en el repaso al practicarlas y los problemas, al fallarlos. Si aciertas sin errores ni pistas, vuelven más tarde (1, 3, 7, 14 y ${lastDays} días); si fallas, mañana.`,
    openings: 'Aperturas',
    openingMeta: (white: boolean, box: number, maxBox: number) => `· ${white ? 'blancas' : 'negras'} · caja ${box} de ${maxBox}`,
    noOpenings: 'Ninguna apertura pendiente hoy.',
    puzzles: 'Problemas',
    sessionTitle: 'Repaso',
    puzzlesDue: (n: number) => (n === 1 ? 'Tienes 1 problema para repasar.' : `Tienes ${n} problemas para repasar.`),
    start: 'Empezar',
    noPuzzles: 'Ningún problema pendiente hoy.',
    empty: 'Todavía no hay nada que repasar. Practica una apertura o resuelve problemas y aparecerán aquí.',
    allDone: (nextDay?: string) => (nextDay ? `¡Todo al día! El próximo repaso es el ${nextDay}.` : '¡Todo al día!'),
    tracked: (n: number) => `Elementos en el repaso: ${n}.`,
    trackedDetail: (openings: number, puzzles: number) => `Aperturas: ${openings} · problemas: ${puzzles}.`,
    banner: (n: number) => (n === 1 ? 'Hoy tienes 1 repaso pendiente.' : `Hoy tienes ${n} repasos pendientes.`),
    bannerButton: 'Repasar',
  },

  install: {
    benefit: 'Ábrela desde la pantalla de inicio, a pantalla completa y también sin conexión.',
    installed: 'App instalada en la pantalla de inicio.',
    iosTitle: 'Añadir a la pantalla de inicio',
    // {share}: icono de compartir. El texto en ** va en negrita.
    iosStep1: 'Toca el botón **Compartir** {share} de Safari, en la barra de abajo o arriba.',
    iosShareIcon: '(icono de compartir)',
    iosStep2: 'Elige **Añadir a pantalla de inicio** {add}. Si no aparece, desliza la lista hacia abajo.',
    iosStep3: 'Pulsa **Añadir**. La app aparecerá con su icono junto a las demás.',
    installedLabel: 'Instalada',
    installedHelp: 'Ya la tienes en la pantalla de inicio.',
    install: 'Instalar',
    howTo: 'Cómo hacerlo',
    installApp: 'Instalar la app',
    installIphone: 'Instalar en el iPhone',
    startNow: 'Empezar ahora',
  },

  welcome: {
    label: 'Bienvenida',
    title: '¿Primera vez por aquí?',
    text: 'Descubre qué puedes aprender con Ajedrez Tutor y cómo instalarla en tu móvil.',
    learnMore: 'Conocer la app',
    close: 'Cerrar el aviso',
  },

  notices: {
    updateTitle: 'Nueva versión de Ajedrez Tutor',
    updateText: 'Actualiza para tener las últimas mejoras. Tu progreso se conserva.',
    update: 'Actualizar',
    later: 'Más tarde',
    offlineTitle: 'Ya puedes usarla sin conexión',
    offlineText: 'Se ha guardado en este dispositivo: todo funciona aunque no tengas internet, también el motor.',
  },

  about: {
    button: 'Acerca de Ajedrez Tutor',
    tagline: 'Aprende ajedrez desde cero, a tu ritmo.',
  },

  board: {
    promotionLabel: 'Elige la pieza de coronación',
    promoteTo: 'Coronar a…',
    pieces: { queen: 'Dama', rook: 'Torre', bishop: 'Alfil', knight: 'Caballo' },
    cancel: 'Cancelar',
  },

  meta: {
    pageTitle: (title: string) => `${title} · Ajedrez Tutor`,
    description: 'Aprende ajedrez desde cero: aperturas paso a paso y ejercicios valorados con Stockfish.',
    appleTitle: 'Ajedrez',
    ogLocale: 'es_ES',
  },

  footer: {
    about: 'Qué es Ajedrez Tutor',
    credits: 'Créditos',
    license: 'Software libre (GPL-3)',
    versionTitle: 'Versión de la app y commit con el que se compiló',
  },

  pages: {
    home: { title: 'Temario', intro: 'Aprende a tu ritmo: sigue los bloques en orden o salta a lo que te interese.' },
    notFound: { title: 'Página no encontrada' },
    progress: { metaTitle: 'Progreso', title: 'Progreso y ajustes' },
    review: { title: 'Repaso' },
    lesson: { fallback: 'Lección', block: (block: number, summary: string) => `Bloque ${block} · ${summary}` },
    opening: {
      fallback: 'Apertura',
      // {practice}: enlace a la práctica.
      note: (trap: boolean, white: boolean, eco?: string, branches?: boolean) =>
        `${trap ? 'Trampa' : 'Recorrido paso a paso'} · juegas con ${white ? 'blancas' : 'negras'}` +
        `${eco ? ` · ECO ${eco}${branches ? ' en la línea principal' : ''}` : ''} · {practice}`,
      practiceLink: 'Ir a la práctica',
      practiceTitle: (name: string) => `Práctica: ${name}`,
      // {walkthrough}: enlace al recorrido.
      practiceNote: (white: boolean) =>
        `Juega tú las jugadas de las ${white ? 'blancas' : 'negras'}; Stockfish valora cada una · {walkthrough}`,
      walkthroughLink: 'Ver el recorrido',
    },
    puzzles: { title: 'Ejercicios', metaTitle: (set: string) => `Ejercicios: ${set}`, topics: 'Temas', all: 'Todos' },
  },

  credits: {
    title: 'Créditos',
    // {license}, {umami}, {freelanz}, {claude}, {lichess}, {catalog}…: enlaces. El texto en ** va en negrita.
    license: '{appName} es software libre bajo la licencia {license}. Es gratuito, no tiene cuentas y tu progreso se guarda solo en este navegador.',
    licenseName: 'GNU GPL v3 o posterior',
    stats: 'Para saber cuánta gente la usa, se recogen estadísticas anónimas de visitas con {umami}: sin cookies ni datos personales, y sin nada de tu progreso.',
    authors: 'Idea y diseño de webapp por {freelanz}, desarrollado con el apoyo de inteligencia artificial ({claude} by Anthropic).',
    contact: 'Contacto',
    data: 'Datos',
    dataPuzzles: 'Ejercicios: base de datos de problemas de {lichess}, publicada bajo licencia CC0 (dominio público). Gracias a Lichess y a su comunidad.',
    dataOpenings: 'Nombres y códigos de aperturas: catálogo {catalog} (CC0).',
    dataLessons: 'Textos y notas de las lecciones: originales de este proyecto.',
    software: 'Software',
    stockfish: '{stockfish} (GPL-3), compilado a WebAssembly por {stockfishjs}.',
    chessground: '{chessground} (GPL-3) para el tablero.',
    pieces: 'Piezas {cburnett}, de Colin M. L. Burnett (licencias libres GPL/BSD/GFDL).',
    chessjs: '{chessjs} (BSD-2) para las reglas.',
    next: '{next} y {react} (MIT).',
    serwist: '{serwist} (MIT) para el funcionamiento sin conexión.',
    notAffiliated: 'Este proyecto no está afiliado a Lichess ni a Stockfish.',
  },

  info: {
    title: 'Ajedrez Tutor · Aprende ajedrez desde cero, gratis',
    description:
      'Aprende ajedrez desde cero en el móvil: lecciones guiadas, aperturas paso a paso, ejercicios reales y repaso espaciado. Gratis, sin cuentas y también sin conexión.',
    browserRequirements: 'Requiere un navegador actual con JavaScript.',
    stats: {
      blocks: 'bloques de temario',
      lessons: 'lecciones guiadas',
      openings: 'aperturas y trampas',
      puzzles: 'ejercicios reales',
    },
    statsLabel: 'El contenido en cifras',
    features: [
      {
        title: 'Lecciones guiadas',
        text: 'Explicaciones breves, preguntas y ejercicios sobre el tablero. Sin teoría interminable: cada idea se practica en el momento.',
      },
      {
        title: 'Aperturas paso a paso',
        text: 'Un repertorio sencillo para blancas y negras, con una frase que explica cada jugada y una práctica para fijarlo.',
      },
      {
        title: 'Ejercicios de partidas reales',
        text: 'Problemas de la base de datos de Lichess ordenados por dificultad: mates, piezas colgadas, ataques dobles, clavadas…',
      },
      {
        title: 'Stockfish valora tus jugadas',
        text: 'El motor de ajedrez más fuerte del mundo, dentro de tu móvil, te dice si una jugada es buena, una imprecisión o un error.',
      },
      {
        title: 'Repaso espaciado',
        text: 'Lo que fallas vuelve a aparecer a los pocos días, y cada vez más espaciado, hasta que lo dominas.',
      },
      {
        title: 'Tu progreso, en tu dispositivo',
        text: 'Sin registro ni cuentas. Tu avance se guarda solo en tu móvil y puedes exportarlo para llevarlo a otro.',
      },
    ],
    // Respuestas en texto plano: se muestran tal cual y también van en los datos estructurados (FAQPage).
    faq: [
      {
        q: '¿Es gratis?',
        a: 'Sí, del todo: sin anuncios, sin pagos dentro de la app y sin versión «premium». Es software libre (licencia GPL-3).',
      },
      {
        q: '¿Necesito saber jugar?',
        a: 'No. Empieza por cómo se mueven las piezas y avanza a tu ritmo hasta mates, aperturas, táctica y finales básicos.',
      },
      {
        q: '¿Tengo que crear una cuenta?',
        a: 'No hay cuentas. Abres la app y empiezas. Tu progreso se guarda en tu dispositivo, no en ningún servidor.',
      },
      {
        q: '¿Funciona sin internet?',
        a: 'Sí. Tras la primera visita, todo (lecciones, ejercicios y el motor Stockfish) funciona sin conexión.',
      },
      {
        q: '¿Cómo la instalo en el móvil?',
        a: 'En Android, con el botón «Instalar la app» de esta página o desde el menú del navegador. En iPhone, desde Safari: botón Compartir y «Añadir a pantalla de inicio». No pasa por ninguna tienda de aplicaciones.',
      },
      {
        q: '¿Y si cambio de móvil?',
        a: 'En la pestaña Progreso puedes exportar tu avance a un fichero e importarlo en el otro dispositivo.',
      },
    ],
    badges: ['Gratis', 'Sin cuentas', 'Sin conexión', 'Software libre'],
    // El texto en ** va resaltado.
    heroTitle: 'Aprende ajedrez desde cero, **a tu ritmo**',
    heroText:
      'Ajedrez Tutor te lleva de mover las piezas a jugar con criterio: lecciones cortas, aperturas explicadas jugada a jugada y ejercicios en los que Stockfish valora cada movimiento. Pensada para ratos sueltos en el móvil.',
    seeCurriculum: 'Ver el temario',
    offline: 'En el móvil o el ordenador, también sin conexión.',
    curriculumEyebrow: 'El temario',
    curriculumTitle: 'Qué vas a aprender',
    curriculumText:
      'Siete bloques en orden, de lo más básico a tu primer repertorio. Puedes seguirlos uno tras otro o saltar a lo que te interese.',
    howEyebrow: 'Cómo funciona',
    howTitle: 'Aprender jugando, no leyendo',
    howText: 'Cada concepto se practica en el tablero al momento, y la app te dice qué tal lo has hecho.',
    installEyebrow: 'En tu pantalla de inicio',
    installTitle: 'Llévala siempre en el bolsillo',
    installText:
      'Instálala como una app más: se abre a pantalla completa, desde su icono y sin conexión. Sin tiendas de aplicaciones, sin descargas pesadas y sin permisos.',
    android: 'Android',
    androidSteps: [
      'Abre esta página en Chrome.',
      'Pulsa «Instalar la app» o, en el menú ⋮, «Añadir a pantalla de inicio».',
      'Confirma con «Instalar».',
    ],
    ios: 'iPhone y iPad',
    iosSteps: ['Abre esta página en Safari.', 'Toca Compartir y elige «Añadir a pantalla de inicio».', 'Confirma con «Añadir».'],
    faqEyebrow: 'Dudas',
    faqTitle: 'Preguntas frecuentes',
    ctaTitle: 'Empieza hoy tu primera lección',
    ctaText: 'Arranca por el tablero y las piezas. Sin registro, sin esperas.',
  },

  landing: {
    boardOpening: 'Apertura Italiana',
    boardStart: 'Posición inicial',
  },
};

export type Messages = typeof es;
