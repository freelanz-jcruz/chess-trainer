import type { Metadata } from 'next';
import Link from 'next/link';
import type * as React from 'react';
import {
  BookOpen,
  ChevronRight,
  Cpu,
  GraduationCap,
  History,
  Puzzle,
  Route,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from 'lucide-react';
import { InstallButton } from '@/components/InstallApp';
import LandingBoard from '@/components/landing/LandingBoard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { withBase } from '@/lib/base-path';
import { curriculum, openings, puzzles } from '@/lib/content/load';
import { absoluteUrl, OPEN_GRAPH_BASE } from '@/lib/site';
import { DEFAULT_LOCALE, getMessages } from '@/lib/i18n';
import { Bold } from '@/lib/i18n/bold';

const t = getMessages(DEFAULT_LOCALE);
const ti = t.info;

export const metadata: Metadata = {
  title: ti.title,
  description: ti.description,
  alternates: { canonical: '/info/' },
  openGraph: { ...OPEN_GRAPH_BASE, title: ti.title, description: ti.description, url: '/info/' },
};

// Cifras del contenido, calculadas al compilar: se actualizan solas al añadir lecciones o ejercicios.
const available = curriculum.blocks.flatMap((b) => b.lessons).filter((l) => l.status === 'available');
const STATS = [
  { value: curriculum.blocks.length, label: ti.stats.blocks },
  { value: available.filter((l) => l.type === 'lesson').length, label: ti.stats.lessons },
  { value: openings.length, label: ti.stats.openings },
  { value: puzzles.length, label: ti.stats.puzzles },
];

/** Iconos de las ventajas, en el orden de `info.features` del diccionario. */
const FEATURE_ICONS: React.ElementType[] = [GraduationCap, Route, Puzzle, Cpu, History, ShieldCheck];
const FEATURES = ti.features.map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] }));
const FAQ = ti.faq;

/**
 * Datos estructurados (schema.org) para los buscadores: la app como aplicación web educativa y gratuita,
 * y las preguntas frecuentes.
 */
const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t.appName,
    url: absoluteUrl('/'),
    description: ti.description,
    image: absoluteUrl('/icons/icon-512.png'),
    inLanguage: DEFAULT_LOCALE,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    browserRequirements: ti.browserRequirements,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    license: 'https://www.gnu.org/licenses/gpl-3.0.html',
    author: { '@type': 'Organization', name: 'freelanz.es', url: 'https://freelanz.es' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  },
];

/** Encabezado de sección: antetítulo, título y entradilla. */
function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto mb-8 grid max-w-2xl gap-2 text-center">
      <p className="m-0 text-xs font-semibold tracking-[0.14em] text-primary uppercase">{eyebrow}</p>
      <h2 className="m-0 text-2xl tracking-tight trainer:text-3xl">{title}</h2>
      {children && <p className="m-0 text-muted-foreground">{children}</p>}
    </div>
  );
}

/** Presentación de la app (landing de una sola página), pensada para buscadores y para quien llega por primera vez. */
export default function InfoPage() {
  return (
    <div className="grid gap-20 pb-8 trainer:gap-28">
      <script
        type="application/ld+json"
        // Contenido propio y estático; se escapa «<» para que ningún texto pueda cerrar la etiqueta.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, '\\u003c') }}
      />
      {/* Portada */}
      <section className="grid items-center gap-10 pt-6 trainer:grid-cols-[1.1fr_1fr] trainer:gap-14 trainer:pt-12">
        <div className="grid justify-items-center gap-6 text-center trainer:justify-items-start trainer:text-left">
          <img
            src={withBase('/icons/icon-512.png')}
            alt=""
            width={80}
            height={80}
            className="size-20 rounded-2xl shadow-lg trainer:hidden"
          />
          <div className="flex flex-wrap justify-center gap-2 trainer:justify-start">
            {ti.badges.map((b) => (
              <Badge key={b} variant="muted">
                {b}
              </Badge>
            ))}
          </div>
          <h1 className="m-0 text-4xl leading-[1.1] tracking-tight text-balance trainer:text-5xl">
            <Bold text={ti.heroTitle} highlight={(part) => <span className="text-primary">{part}</span>} />
          </h1>
          <p className="m-0 max-w-xl text-lg text-muted-foreground text-pretty">
            {ti.heroText}
          </p>
          <div className="flex flex-wrap justify-center gap-3 trainer:justify-start">
            <InstallButton />
            <Button size="lg" variant="outline" asChild>
              <Link href="/">
                {ti.seeCurriculum} <ChevronRight />
              </Link>
            </Button>
          </div>
          <p className="m-0 text-sm text-muted-foreground">
            <WifiOff className="mr-1.5 inline size-4 align-[-0.2em]" aria-hidden />
            {ti.offline}
          </p>
        </div>
        <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-border bg-card p-4 shadow-xl trainer:p-5">
          <LandingBoard />
        </div>
      </section>

      {/* Cifras */}
      <section aria-label={ti.statsLabel} className="-mt-8 trainer:-mt-14">
        <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border trainer:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="grid gap-1 bg-card px-4 py-5 text-center">
              <dt className="order-last text-sm text-muted-foreground">{s.label}</dt>
              <dd className="m-0 text-3xl font-bold tracking-tight text-primary tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Temario */}
      <section>
        <SectionHeading eyebrow={ti.curriculumEyebrow} title={ti.curriculumTitle}>
          {ti.curriculumText}
        </SectionHeading>
        <ol className="m-0 grid list-none gap-3 p-0 trainer:grid-cols-2">
          {curriculum.blocks.map((b) => (
            <li key={b.id} className="flex gap-4 rounded-xl border border-border bg-card p-4">
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-content-center rounded-full bg-primary font-bold text-primary-foreground tabular-nums"
              >
                {b.id}
              </span>
              <div className="grid gap-1">
                <h3 className="m-0 text-base font-semibold">{b.title}</h3>
                <p className="m-0 text-sm text-muted-foreground">{b.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Cómo aprendes */}
      <section>
        <SectionHeading eyebrow={ti.howEyebrow} title={ti.howTitle}>
          {ti.howText}
        </SectionHeading>
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 trainer:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="grid grid-cols-[auto_1fr] content-start gap-x-4 gap-y-1 rounded-xl border border-border bg-card p-4 sm:grid-cols-1 sm:gap-y-3 sm:p-5"
            >
              <span className="row-span-2 grid size-10 place-content-center rounded-lg bg-primary/15 text-primary sm:row-span-1">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="m-0 self-center text-base font-semibold">{title}</h3>
              <p className="m-0 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Instalar */}
      <section className="grid gap-8 rounded-2xl border border-border bg-card p-6 trainer:grid-cols-[1fr_1.2fr] trainer:items-center trainer:p-10">
        <div className="grid justify-items-center gap-4 text-center trainer:justify-items-start trainer:text-left">
          <p className="m-0 text-xs font-semibold tracking-[0.14em] text-primary uppercase">{ti.installEyebrow}</p>
          <h2 className="m-0 text-2xl tracking-tight trainer:text-3xl">{ti.installTitle}</h2>
          <p className="m-0 text-muted-foreground">
            {ti.installText}
          </p>
          <InstallButton />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InstallSteps title={ti.android} steps={ti.androidSteps} />
          <InstallSteps title={ti.ios} steps={ti.iosSteps} />
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section>
        <SectionHeading eyebrow={ti.faqEyebrow} title={ti.faqTitle} />
        <div className="mx-auto grid max-w-2xl gap-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-xl border border-border bg-card px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {q}
                <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
              </summary>
              <p className="m-0 mt-3 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Llamada final */}
      <section className="grid justify-items-center gap-5 rounded-2xl bg-primary/10 px-6 py-12 text-center">
        <BookOpen className="size-8 text-primary" aria-hidden />
        <h2 className="m-0 max-w-xl text-2xl tracking-tight text-balance trainer:text-3xl">
          {ti.ctaTitle}
        </h2>
        <p className="m-0 max-w-lg text-muted-foreground">{ti.ctaText}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/">
              {t.install.startNow} <ChevronRight />
            </Link>
          </Button>
          <InstallButton fallback={false} />
        </div>
      </section>
    </div>
  );
}

function InstallSteps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="grid content-start gap-3 rounded-xl border border-border bg-background/40 p-4">
      <h3 className="m-0 flex items-center gap-2 text-base font-semibold">
        <Smartphone className="size-4 text-primary" aria-hidden /> {title}
      </h3>
      <ol className="m-0 grid list-decimal gap-1.5 pl-5 text-sm text-muted-foreground">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
