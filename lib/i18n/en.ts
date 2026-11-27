import type { Messages } from './es';

const plural = (n: number, one: string, many: string) => (n === 1 ? `1 ${one}` : `${n} ${many}`);

/** Textos de la interfaz en inglés. Mismas claves que es.ts (lo exige el tipo `Messages`). */
export const en: Messages = {
  appName: 'Ajedrez Tutor',

  level: { principiante: 'Beginner', intermedio: 'Intermediate', avanzado: 'Advanced' },

  theme: {
    names: { navy: 'Navy', dark: 'Dark grey', light: 'Light' },
    switchTo: (name: string) => `Switch to ${name.toLowerCase()} theme`,
    title: (name: string) => `${name} theme`,
  },

  verdict: {
    correct: 'Correct',
    good: 'Good alternative',
    inaccuracy: 'Inaccuracy',
    mistake: 'Mistake',
    blunder: 'Blunder',
  },

  feedback: {
    thinking: 'Analysing…',
    allowsMate: 'allows mate',
    missesMate: 'misses the mate',
    lossTitle: 'Pawns lost compared with the best move',
  },

  moveList: { label: 'Moves' },

  curriculum: {
    soon: 'coming soon',
    openingPracticed: (n: number) => `practised ${n}×`,
    openingSeen: 'seen',
    lessonCompleted: 'completed ✓',
    lessonStarted: 'started',
    hiddenByLevel: (n: number) => (n === 1 ? 'One more lesson at higher levels' : `${n} more lessons at higher levels`),
    changeLevel: 'change the level',
  },
  progress: {
    loading: 'Loading…',
    summary: (lessons: number, puzzles: number, openings: number, reviews: number) =>
      `${plural(lessons, 'lesson completed', 'lessons completed')}, ${plural(puzzles, 'puzzle solved', 'puzzles solved')}, ` +
      `${plural(openings, 'opening practised', 'openings practised')} and ${plural(reviews, 'item', 'items')} in review`,
    exportFileName: (day: string) => `ajedrez-tutor-progress-${day}.json`,
    exported: 'Progress exported',
    exportedDetail: 'Save the file wherever you like.',
    notAProgressFile: 'That file is not an Ajedrez Tutor progress file.',
    imported: 'Progress imported',
    deleted: 'Progress deleted',
    deletedDetail: 'You can start from scratch.',
    title: 'Your progress',
    intro: (summary: string) =>
      `Your progress is only saved in this browser: ${summary}. To keep it safe or move it to another device, export it to a file and import it wherever you like.`,
    export: 'Export progress',
    import: 'Import progress…',
    importTitle: 'Import this progress?',
    importHas: (summary: string) => `**The file contains:** ${summary}.`,
    importReplaces: (summary: string) => `**It will replace your current progress** on this device: ${summary}.`,
    cancel: 'Cancel',
    importConfirm: 'Import',
    deleteIntro: 'Deleting your progress removes lessons, openings, puzzles and reviews. Your settings are kept.',
    delete: 'Delete all progress…',
    deleteTitle: 'Delete all progress?',
    deleteWhat: (summary: string) => `All your progress on this device will be deleted: ${summary}.`,
    deleteWarning: 'Your settings are kept. **This cannot be undone**: if you want a copy, export your progress first.',
    deleteConfirm: 'Delete all',
  },

  settings: {
    title: 'Settings',
    level: 'Level',
    levelHelp: 'The course, the opening variations and the puzzles show your level and the ones below it.',
    theme: 'Theme',
    themeHelp: 'Navy, dark grey or light; also from the button in the header.',
    coordinates: 'Coordinates',
    coordinatesHelp: 'Letters and numbers for files and ranks on the edge of the board.',
    engineTime: 'Analysis time',
    engineTimeHelp: 'How long Stockfish thinks about each move: more time, more accurate evaluations.',
    engineFast: '0.5 s (fast)',
    engineMedium: '1 s',
    enginePrecise: '2 s (accurate)',
    install: 'Install the app',
  },

  common: {
    hint: 'Hint',
    restart: 'Start again',
    moves: 'Moves',
    movesCount: (n: number) => `Moves · ${n}`,
    again: 'Again',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    continue: 'Continue',
    understood: 'Got it',
    tryAgain: 'Try again.',
  },

  openingPractice: {
    start: 'Your turn. Play the first move of the opening.',
    doneClean: (trap: boolean) => (trap ? 'Trap completed without mistakes!' : 'Opening completed without mistakes!'),
    doneWith: (trap: boolean, errors: number, hints: number) =>
      `${trap ? 'Trap completed' : 'Opening completed'} with ${plural(errors, 'mistake', 'mistakes')} and ${plural(hints, 'hint', 'hints')}.`,
    alternative: (bookMove: string) => `That is played too, but in this line we continue with ${bookMove}.`,
    playableButNotBook: 'It is playable, but this opening goes a different way. Try again.',
    arrowShown: 'The opening move is marked with an arrow.',
    runs: (runs: number, clean: number) => `Practice runs: ${runs} · without mistakes: ${clean}`,
    line: (names: string[]) => `Line: ${names.length ? names.join(' › ') : 'main'}`,
    reviewWalkthrough: 'Review the walkthrough',
  },

  walkthrough: {
    intro: (summary: string) => `${summary} Press “Next” to begin.`,
    toStart: 'To the start',
    branchesHere: 'Here the game can continue in several ways:',
    mainLine: (move: string) => `${move} · main`,
    lineMoves: 'Moves of the line',
    movesProgress: (index: number, total: number) => `Moves · ${index}/${total}`,
    tapMove: 'Tap a move to see it on the board.',
    seenAll: 'You have seen the whole line.',
    practiceNow: 'Practise now',
  },

  puzzles: {
    skippedLeft: (n: number) =>
      n === 1
        ? 'You skipped the last remaining puzzle: it stays pending.'
        : `You skipped the ${n} remaining puzzles: they stay pending.`,
    reviewDone: 'No puzzles left to review today. Well done!',
    none: 'No puzzles.',
    loading: 'Loading puzzles…',
    headerReview: (title: string, due: number, rating: number) => `${title} · ${due} left today · difficulty ${rating}`,
    headerSet: (title: string, solved: number, total: number, rating: number) =>
      `${title} · solved ${solved}/${total} · difficulty ${rating}`,
    watchOpponent: 'Watch your opponent’s move…',
    yourTurn: 'Your turn.',
    solved: 'Solved!',
    keepGoing: 'Keep going…',
    notBad: 'Not bad, but there is something better. Try again.',
    prompt: (white: boolean) => `${white ? 'White' : 'Black'} to play: find the best move.`,
    skip: 'Skip',
    source: 'Puzzle {link} from the Lichess puzzle database (CC0).',
    solvedSummary: (errors: number, hint: boolean) => {
      if (!errors && !hint) return 'First try, no hints.';
      const fails = plural(errors, 'mistake', 'mistakes');
      if (errors && hint) return `Solved with ${fails} and a hint.`;
      return `Solved with ${errors ? fails : 'a hint'}.`;
    },
  },

  lesson: {
    kind: { text: 'Explanation', quiz: 'Question', move: 'Your move', drill: 'Exercise', play: 'Against Stockfish' },
    pagesLabel: (page: number, total: number) => `Page ${page} of ${total}`,
    pageDot: (page: number, kind: string) => `Page ${page}: ${kind}`,
    completed: 'Lesson completed!',
    finishedLesson: (title: string) => `You have finished “${title}”.`,
    backToCurriculum: 'Back to the course',
    nextLesson: 'Next lesson',
    correct: 'Correct!',
    achieved: 'Done!',
    wellDone: 'Well done!',
    yourTurn: 'Your turn.',
    watchOpponent: 'Watch your opponent’s move…',
    repeat: 'Repeat',
    notThatMove: 'That is not the move we are looking for. Try again.',
    notMate: 'That is not mate. Try again.',
    somethingBetter: 'There is something better. Try again.',
    goal: (checkmate: boolean, maxMoves?: number) => {
      const goal = checkmate ? 'Deliver checkmate' : 'Promote a pawn';
      if (!maxMoves) return `${goal}.`;
      return `${goal} in at most ${plural(maxMoves, 'move', 'moves')}.`;
    },
    achievedIn: (n: number) => `Done in ${plural(n, 'move', 'moves')}!`,
    stalemate: 'Stalemate! The enemy king is not in check but cannot move: it is a draw. Try another move.',
    noMateIn: (n: number) => `That does not lead to mate in ${n}. Try again.`,
    winSlips: 'That lets the win slip away. Try again.',
    outOfMoves: 'Out of moves. Try again!',
    movesSoFar: (n: number, max?: number) => (max ? `Moves: ${n} of ${max}` : `Moves: ${n}`),
    wonSummary: (checkmate: boolean, n: number) => `${checkmate ? 'Mate' : 'Pawn promoted'} in ${plural(n, 'move', 'moves')}.`,
    outOfMovesTitle: 'Out of moves',
    notAchievedIn: (n: number) => `You did not manage it in ${plural(n, 'move', 'moves')}. Try again!`,
    drillStart: (par?: number) => (par ? `Your turn. Target: ${plural(par, 'move', 'moves')}.` : 'Your turn.'),
    drillDone: (n: number, perfect: boolean) =>
      `Done in ${plural(n, 'move', 'moves')}!${perfect ? ' That is the minimum possible.' : ''}`,
    drillCanDoBetter: (n: number, par: number) => `Done in ${n} moves! It can be done in ${par}: want to try again?`,
    drillProgress: (n: number, par?: number) => (par ? `Moves: ${n} · target: ${par}` : `Moves: ${n}`),
    drillSummary: (n: number, par?: number) => `In ${plural(n, 'move', 'moves')}${par ? ': the minimum possible.' : '.'}`,
    drillSummaryBetter: (n: number, par: number) => `In ${n} moves. It can be done in ${par}: want to try again?`,
    tryAgainButton: 'Try again',
    wrongAnswer: 'Not that one. Try again.',
    wrongTitle: 'Not that one',
    tryAnother: 'Try again',
    seeAnswersAgain: 'See the answers',
    seeAnswers: 'See answers',
    answers: 'Answers',
  },

  intlLocale: 'en-GB',

  nav: {
    label: 'Main',
    curriculum: 'Course',
    review: 'Review',
    puzzles: 'Puzzles',
    progress: 'Progress',
    pending: (n: number) => `${n} pending`,
  },

  review: {
    loading: 'Loading…',
    intro: (lastDays: number) =>
      `Reviewing what you have learned at ever longer intervals helps you not to forget it. Openings enter the review when you practise them, and puzzles when you miss them. If you get it right with no mistakes or hints, it comes back later (1, 3, 7, 14 and ${lastDays} days); if you miss it, tomorrow.`,
    openings: 'Openings',
    openingMeta: (white: boolean, box: number, maxBox: number) => `· ${white ? 'White' : 'Black'} · box ${box} of ${maxBox}`,
    noOpenings: 'No openings due today.',
    puzzles: 'Puzzles',
    sessionTitle: 'Review',
    puzzlesDue: (n: number) => (n === 1 ? 'You have 1 puzzle to review.' : `You have ${n} puzzles to review.`),
    start: 'Start',
    noPuzzles: 'No puzzles due today.',
    empty: 'Nothing to review yet. Practise an opening or solve some puzzles and they will show up here.',
    allDone: (nextDay?: string) => (nextDay ? `All caught up! Your next review is on ${nextDay}.` : 'All caught up!'),
    tracked: (n: number) => `Items in review: ${n}.`,
    trackedDetail: (openings: number, puzzles: number) => `Openings: ${openings} · puzzles: ${puzzles}.`,
    banner: (n: number) => (n === 1 ? 'You have 1 review due today.' : `You have ${n} reviews due today.`),
    bannerButton: 'Review',
  },

  install: {
    benefit: 'Open it from your home screen, full screen and offline too.',
    installed: 'App installed on your home screen.',
    iosTitle: 'Add to Home Screen',
    iosStep1: 'Tap Safari’s **Share** button {share}, in the bar at the bottom or top.',
    iosShareIcon: '(share icon)',
    iosStep2: 'Choose **Add to Home Screen** {add}. If you don’t see it, scroll the list down.',
    iosStep3: 'Tap **Add**. The app will appear with its icon next to your other apps.',
    installedLabel: 'Installed',
    installedHelp: 'It is already on your home screen.',
    install: 'Install',
    howTo: 'How to',
    installApp: 'Install the app',
    installIphone: 'Install on iPhone',
    startNow: 'Start now',
  },

  welcome: {
    label: 'Welcome',
    title: 'First time here?',
    text: 'Find out what you can learn with Ajedrez Tutor and how to install it on your phone.',
    learnMore: 'About the app',
    close: 'Close notice',
  },

  notices: {
    updateTitle: 'New version of Ajedrez Tutor',
    updateText: 'Update to get the latest improvements. Your progress is kept.',
    update: 'Update',
    later: 'Later',
    offlineTitle: 'Ready to use offline',
    offlineText: 'It has been saved on this device: everything works without internet, including the engine.',
  },

  about: {
    button: 'About Ajedrez Tutor',
    tagline: 'Learn chess from scratch, at your own pace.',
  },

  board: {
    promotionLabel: 'Choose the promotion piece',
    promoteTo: 'Promote to…',
    pieces: { queen: 'Queen', rook: 'Rook', bishop: 'Bishop', knight: 'Knight' },
    cancel: 'Cancel',
  },

  meta: {
    pageTitle: (title: string) => `${title} · Ajedrez Tutor`,
    description: 'Learn chess from scratch: step-by-step openings and exercises evaluated by Stockfish.',
    appleTitle: 'Ajedrez',
    ogLocale: 'en_GB',
  },

  footer: {
    about: 'What is Ajedrez Tutor',
    credits: 'Credits',
    license: 'Free software (GPL-3)',
    versionTitle: 'App version and the commit it was built from',
  },

  pages: {
    home: { title: 'Course', intro: 'Learn at your own pace: follow the blocks in order or jump to whatever interests you.' },
    notFound: { title: 'Page not found' },
    progress: { metaTitle: 'Progress', title: 'Progress and settings' },
    review: { title: 'Review' },
    lesson: { fallback: 'Lesson', block: (block: number, summary: string) => `Block ${block} · ${summary}` },
    opening: {
      fallback: 'Opening',
      note: (trap: boolean, white: boolean, eco?: string, branches?: boolean) =>
        `${trap ? 'Trap' : 'Step-by-step walkthrough'} · you play ${white ? 'White' : 'Black'}` +
        `${eco ? ` · ECO ${eco}${branches ? ' in the main line' : ''}` : ''} · {practice}`,
      practiceLink: 'Go to practice',
      practiceTitle: (name: string) => `Practice: ${name}`,
      practiceNote: (white: boolean) => `You play ${white ? 'White' : 'Black'}’s moves; Stockfish evaluates each one · {walkthrough}`,
      walkthroughLink: 'See the walkthrough',
    },
    puzzles: { title: 'Puzzles', metaTitle: (set: string) => `Puzzles: ${set}`, topics: 'Themes', all: 'All' },
  },

  credits: {
    title: 'Credits',
    license: '{appName} is free software under the {license} licence. It is free of charge, has no accounts, and your progress is saved only in this browser.',
    licenseName: 'GNU GPL v3 or later',
    stats: 'To know how many people use it, anonymous visit statistics are collected with {umami}: no cookies, no personal data and nothing about your progress.',
    authors: 'Web app idea and design by {freelanz}, developed with the help of artificial intelligence ({claude} by Anthropic).',
    contact: 'Contact',
    data: 'Data',
    dataPuzzles: 'Puzzles: the {lichess} puzzle database, published under the CC0 licence (public domain). Thanks to Lichess and its community.',
    dataOpenings: 'Opening names and codes: the {catalog} catalogue (CC0).',
    dataLessons: 'Lesson texts and notes: original to this project.',
    software: 'Software',
    stockfish: '{stockfish} (GPL-3), compiled to WebAssembly by {stockfishjs}.',
    chessground: '{chessground} (GPL-3) for the board.',
    pieces: '{cburnett} pieces, by Colin M. L. Burnett (free licences GPL/BSD/GFDL).',
    chessjs: '{chessjs} (BSD-2) for the rules.',
    next: '{next} and {react} (MIT).',
    serwist: '{serwist} (MIT) for offline support.',
    notAffiliated: 'This project is not affiliated with Lichess or Stockfish.',
  },

  info: {
    title: 'Ajedrez Tutor · Learn chess from scratch, for free',
    description:
      'Learn chess from scratch on your phone: guided lessons, step-by-step openings, real puzzles and spaced review. Free, no accounts, and offline too.',
    browserRequirements: 'Requires an up-to-date browser with JavaScript.',
    stats: {
      blocks: 'course blocks',
      lessons: 'guided lessons',
      openings: 'openings and traps',
      puzzles: 'real puzzles',
    },
    statsLabel: 'The content in numbers',
    features: [
      {
        title: 'Guided lessons',
        text: 'Short explanations, questions and exercises on the board. No endless theory: every idea is practised right away.',
      },
      {
        title: 'Step-by-step openings',
        text: 'A simple repertoire for White and Black, with a sentence explaining every move and a practice mode to make it stick.',
      },
      {
        title: 'Puzzles from real games',
        text: 'Puzzles from the Lichess database sorted by difficulty: mates, hanging pieces, forks, pins…',
      },
      {
        title: 'Stockfish evaluates your moves',
        text: 'The strongest chess engine in the world, inside your phone, tells you whether a move is good, an inaccuracy or a mistake.',
      },
      {
        title: 'Spaced review',
        text: 'What you get wrong comes back a few days later, and then at longer and longer intervals, until you master it.',
      },
      {
        title: 'Your progress, on your device',
        text: 'No sign-up, no accounts. Your progress is saved only on your phone and you can export it to take it to another one.',
      },
    ],
    faq: [
      {
        q: 'Is it free?',
        a: 'Yes, completely: no ads, no in-app purchases and no “premium” version. It is free software (GPL-3 licence).',
      },
      {
        q: 'Do I need to know how to play?',
        a: 'No. It starts with how the pieces move and takes you, at your own pace, to mates, openings, tactics and basic endgames.',
      },
      {
        q: 'Do I have to create an account?',
        a: 'There are no accounts. Open the app and start. Your progress is saved on your device, not on any server.',
      },
      {
        q: 'Does it work without internet?',
        a: 'Yes. After the first visit, everything (lessons, puzzles and the Stockfish engine) works offline.',
      },
      {
        q: 'How do I install it on my phone?',
        a: 'On Android, with the “Install the app” button on this page or from the browser menu. On iPhone, from Safari: Share button and “Add to Home Screen”. No app store involved.',
      },
      {
        q: 'What if I change phones?',
        a: 'In the Progress tab you can export your progress to a file and import it on the other device.',
      },
    ],
    badges: ['Free', 'No accounts', 'Offline', 'Free software'],
    heroTitle: 'Learn chess from scratch, **at your own pace**',
    heroText:
      'Ajedrez Tutor takes you from moving the pieces to playing with purpose: short lessons, openings explained move by move, and exercises where Stockfish evaluates every move. Made for spare moments on your phone.',
    seeCurriculum: 'See the course',
    offline: 'On your phone or computer, offline too.',
    curriculumEyebrow: 'The course',
    curriculumTitle: 'What you will learn',
    curriculumText:
      'Seven blocks in order, from the very basics to your first repertoire. Follow them one after another or jump to whatever interests you.',
    howEyebrow: 'How it works',
    howTitle: 'Learn by playing, not by reading',
    howText: 'Every concept is practised on the board right away, and the app tells you how you did.',
    installEyebrow: 'On your home screen',
    installTitle: 'Always in your pocket',
    installText:
      'Install it like any other app: it opens full screen, from its icon and offline. No app stores, no heavy downloads and no permissions.',
    android: 'Android',
    androidSteps: [
      'Open this page in Chrome.',
      'Tap “Install the app” or, in the ⋮ menu, “Add to Home screen”.',
      'Confirm with “Install”.',
    ],
    ios: 'iPhone and iPad',
    iosSteps: ['Open this page in Safari.', 'Tap Share and choose “Add to Home Screen”.', 'Confirm with “Add”.'],
    faqEyebrow: 'Questions',
    faqTitle: 'Frequently asked questions',
    ctaTitle: 'Start your first lesson today',
    ctaText: 'Begin with the board and the pieces. No sign-up, no waiting.',
  },

  language: {
    names: { es: 'Español', en: 'English' },
    namesHere: { es: 'Spanish', en: 'English' },
    setting: 'Language',
    settingHelp: 'Your progress and settings are the same in every language.',
    suggestTitle: 'Ajedrez Tutor is also available in English',
    suggestText: 'Lessons, openings and puzzles in your language. Your progress is kept.',
    suggestGo: 'Switch to English',
    suggestStay: (current: string) => `Stay in ${current}`,
    suggestLabel: 'Language',
  },

  landing: {
    boardOpening: 'Italian Game',
    boardStart: 'Starting position',
  },
};
