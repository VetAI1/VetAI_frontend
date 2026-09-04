'use client';

import {
  Activity,
  ArrowRight,
  BedDouble,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  ClipboardPlus,
  CreditCard,
  FileText,
  HeartPulse,
  Package,
  PawPrint,
  Pill,
  Quote,
  Route,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LandingNav } from './components/landing-nav';
import { ProductShowcase } from './components/product-showcase';
import { TextReveal } from './components/text-reveal';

import { BrandLogo } from '@/app/components/brand/brand-logo';
import { CopilotDemo } from '@/app/components/brand/copilot-demo';
import { HospitalizationDemo } from '@/app/components/brand/hospitalization-demo';
import { ManagementDemo } from '@/app/components/brand/management-demo';
import { PrescriptionDemo } from '@/app/components/brand/prescription-demo';
import { Shot } from '@/app/components/brand/shot';
import { Counter } from '@/app/components/common/counter';
import { Reveal } from '@/app/components/common/reveal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { billingService } from '@/services/billing.service';
import type { Plan } from '@/types/billing';

const FEATURES = [
  {
    icon: ClipboardPlus,
    eyebrow: 'Prontuário vivo',
    title: 'Tudo do paciente, no momento certo.',
    description:
      'Histórico, prescrições, peso, vacinas e anotações clínicas em uma visão feita para a rotina.',
  },
  {
    icon: BrainCircuit,
    eyebrow: 'IA com contexto',
    title: 'Exames que viram conversa clínica.',
    description:
      'Envie arquivos e receba leituras organizadas para apoiar sua decisão, não substituí-la.',
  },
  {
    icon: HeartPulse,
    eyebrow: 'Cuidado contínuo',
    title: 'Acompanhe cada sinal com clareza.',
    description:
      'Monitoramento e alertas que deixam a equipe presente, mesmo fora da sala de atendimento.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'O VetAI deixou nossa rotina mais leve. A equipe encontra o histórico completo sem interromper o atendimento.',
    name: 'Dra. Ana Paula',
    role: 'Clínica VetCare',
    initials: 'AP',
  },
  {
    quote:
      'A análise organizada dos exames nos ajuda a ganhar tempo, sem perder o olhar clínico que cada caso pede.',
    name: 'Dr. Carlos Mendes',
    role: 'Hospital Animal',
    initials: 'CM',
  },
  {
    quote:
      'O acompanhamento de internação ficou muito mais seguro para quem está na clínica e para quem entra no plantão.',
    name: 'Dra. Mariana Costa',
    role: 'PetCenter',
    initials: 'MC',
  },
];

function formatPrice(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100">
        <span className="size-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
        {eyebrow}
      </span>
      <h2 className="font-display mt-5 text-3xl font-bold tracking-[-0.06em] text-stone-900 dark:text-stone-100 sm:text-4xl md:text-5xl">
        <TextReveal text={title} />
      </h2>
      {description && (
        <p className="mt-5 max-w-xl text-base leading-7 text-stone-500 dark:text-stone-400 md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    void billingService
      .listPlans()
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <LandingNav />

      <main>
        <section className="relative isolate pt-32 pb-16 sm:pt-40 md:pb-24">
          <div className="surface-pattern absolute inset-x-0 top-0 -z-10 h-[540px] opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="max-w-2xl">
                <Reveal direction="up">
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-800/15 dark:border-teal-500/15 bg-white dark:bg-stone-900 px-3 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-500 shadow-sm">
                    <PawPrint size={14} />
                    Tecnologia que acompanha o cuidado
                  </div>
                </Reveal>
                <Reveal direction="up" delay={60}>
                  <h1 className="font-display mt-6 text-5xl font-bold leading-[0.98] tracking-[-0.075em] text-stone-900 dark:text-stone-100 sm:text-6xl lg:text-7xl">
                    <TextReveal text="Gestão clínica que" />{' '}
                    <span className="text-teal-800 dark:text-teal-500"><TextReveal text="cuida do seu tempo." /></span>
                  </h1>
                </Reveal>
                <Reveal direction="up" delay={120}>
                  <p className="mt-6 max-w-xl text-lg leading-8 text-stone-500 dark:text-stone-400 md:text-xl">
                    Prontuário, exames e acompanhamento inteligente para a sua equipe ter mais clareza e cada paciente receber mais atenção.
                  </p>
                </Reveal>
                <Reveal direction="up" delay={180}>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" className="h-12 px-7 text-base">
                      <Link href="/register">Começar sem compromisso <ArrowRight /></Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-12 px-7 text-base">
                      <a href="#produto">Conhecer a plataforma</a>
                    </Button>
                  </div>
                </Reveal>
                <Reveal direction="up" delay={240}>
                  <div className="mt-10 flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
                    <div className="flex -space-x-2">
                      {['AP', 'CM', 'MC'].map((initials, index) => (
                        <span key={initials} className={`grid size-8 place-items-center rounded-full border-2 border-stone-50 dark:border-stone-950 text-[10px] font-bold text-white dark:text-stone-950 ${index === 1 ? 'bg-amber-500 dark:bg-amber-400 text-amber-900 dark:text-amber-100' : 'bg-teal-800 dark:bg-teal-500'}`}>
                          {initials}
                        </span>
                      ))}
                    </div>
                    Feito para a rotina de clínicas e hospitais veterinários.
                  </div>
                </Reveal>
              </div>

              <Reveal direction="up" delay={160}>
                <Shot
                  className="mx-auto w-full max-w-[560px]"
                  floating={
                    <>
                      <div className="animate-float absolute -right-5 top-12 hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 shadow-[var(--shadow-card)] lg:block">
                        <div className="flex items-center gap-2">
                          <span className="grid size-8 place-items-center rounded-xl bg-amber-500 dark:bg-amber-400 text-amber-900 dark:text-amber-100"><HeartPulse size={16} /></span>
                          <div><p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">Acompanhamento</p><p className="text-xs font-bold text-stone-900 dark:text-stone-100">Sinais estáveis</p></div>
                        </div>
                      </div>
                      <div className="animate-float-delayed absolute -bottom-5 -left-7 hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 py-2.5 shadow-[var(--shadow-card)] lg:flex lg:items-center lg:gap-2">
                        <span className="grid size-7 place-items-center rounded-full bg-stone-100 dark:bg-stone-800 text-teal-800 dark:text-teal-500"><PawPrint size={14} /></span>
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Luna · retorno em dia</span>
                      </div>
                    </>
                  }
                >
                  <ProductShowcase />
                </Shot>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0 px-5 sm:px-8">
            {[
              { value: 2500, suffix: '+', label: 'veterinários ativos' },
              { value: 50000, suffix: '+', label: 'exames organizados' },
              { value: 15, suffix: ' mil+', label: 'pacientes acompanhados' },
              { value: 24, suffix: 'h', label: 'visão da clínica' },
            ].map((stat, index) => (
              <Reveal key={stat.label} direction="up" delay={index * 60}>
                <div className="px-4 py-7 text-center sm:px-7">
                  <p className="font-data text-2xl font-semibold tracking-[-0.07em] text-teal-800 dark:text-teal-500 sm:text-3xl"><Counter target={stat.value} suffix={stat.suffix} /></p>
                  <p className="mt-1 text-xs font-semibold text-stone-500 dark:text-stone-400">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="produto" className="relative isolate overflow-hidden border-y border-stone-200 bg-[oklch(0.985_0.01_95)] py-24 dark:border-stone-800 dark:bg-stone-950 md:py-32">
          <div className="surface-pattern pointer-events-none absolute inset-0 z-0 opacity-50 [mask-image:linear-gradient(135deg,black,transparent_60%)]" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal direction="up"><SectionHeading eyebrow="Uma rotina mais fluida" title="Clínico na essência. Simples na rotina." description="Cada ferramenta foi organizada para apoiar a tomada de decisão e reduzir o trabalho repetitivo da equipe." /></Reveal>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {FEATURES.map((feature, index) => (
                <Reveal key={feature.title} direction="up" delay={index * 80}>
                  <article className="group h-full rounded-[24px] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-7 shadow-[var(--shadow-card)] transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-teal-800/25 dark:hover:border-teal-500/25">
                    <div className="grid size-12 place-items-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-teal-800 dark:text-teal-500"><feature.icon size={23} /></div>
                    <p className="mt-7 text-xs font-bold uppercase tracking-[0.12em] text-teal-800 dark:text-teal-500">{feature.eyebrow}</p>
                    <h3 className="font-display mt-3 text-2xl font-bold tracking-[-0.05em] text-stone-900 dark:text-stone-100">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-stone-500 dark:text-stone-400">{feature.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal direction="up" delay={120}>
              <Shot tilt="right" className="mx-auto mt-16 max-w-4xl">
                <ProductShowcase initialScreen="patients" />
              </Shot>
            </Reveal>
          </div>
        </section>

        <section id="ia" className="relative isolate overflow-hidden border-y border-amber-500/20 bg-amber-500/10 py-24 dark:border-amber-400/15 dark:bg-stone-900 md:py-32">
          <div className="surface-pattern pointer-events-none absolute inset-y-0 right-0 z-0 w-1/2 opacity-40 [mask-image:linear-gradient(to_left,black,transparent)]" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <Reveal direction="up">
                <SectionHeading eyebrow="Do exame à conduta" title="Tecnologia presente. Decisão sempre sua." description="O VetAI organiza dados e destaca contexto. Quem cuida, interpreta e decide continua sendo você." />
                <div className="mt-8 space-y-4">
                  {[
                    { icon: FileText, title: 'Envie', text: 'Exames e documentos chegam ao prontuário.' },
                    { icon: Sparkles, title: 'Revise', text: 'A IA estrutura leituras para sua avaliação.' },
                    { icon: Stethoscope, title: 'Cuide', text: 'Registre a conduta e acompanhe a evolução.' },
                  ].map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <span className="font-data mt-0.5 shrink-0 text-sm font-semibold text-teal-800 dark:text-teal-500">0{index + 1}</span>
                      <div>
                        <h3 className="font-display flex items-center gap-2 text-xl font-bold tracking-[-0.05em]"><step.icon className="text-teal-800 dark:text-teal-500" size={18} />{step.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-stone-400">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal direction="up" delay={150}>
                <Shot className="mx-auto w-full max-w-[520px]">
                  <CopilotDemo />
                </Shot>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="medicamentos" className="relative isolate overflow-hidden bg-white py-24 dark:bg-stone-950 md:py-32">
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <Reveal direction="up">
                <div className="rounded-[24px] border border-stone-200 dark:border-stone-800 bg-[oklch(0.985_0.01_95)] dark:bg-stone-900 p-6 shadow-[var(--shadow-card)] sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-2xl font-bold tracking-[-0.05em] text-stone-900 dark:text-stone-100">Meloxicam</p>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Anti-inflamatório não esteroidal</p>
                    </div>
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-stone-100 dark:bg-stone-800 text-teal-800 dark:text-teal-500"><Pill size={21} /></span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: 'Dose cães', value: '0,1 mg/kg' },
                      { label: 'Dose gatos', value: '0,05 mg/kg' },
                      { label: 'Via', value: 'Oral, SC' },
                      { label: 'Frequência', value: 'A cada 24h' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 px-3.5 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">{item.label}</p>
                        <p className="font-data mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-stone-200 dark:border-stone-800 pt-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Contraindicações</p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {['Insuficiência renal', 'Gestação', 'Úlcera gástrica', 'Desidratação'].map((item) => (
                        <span key={item} className="rounded-full bg-amber-500/15 dark:bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal direction="up" delay={120}>
                <SectionHeading eyebrow="Bulário clínico" title="A bula certa, sem sair do atendimento." description="Consulte dose por espécie, vias de administração, contraindicações e apresentações enquanto conduz a consulta." />
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Scale, title: 'Dose por espécie', text: 'Referências para cães, gatos, equinos e bovinos.' },
                    { icon: Route, title: 'Vias e frequência', text: 'Como administrar e em qual intervalo.' },
                    { icon: TriangleAlert, title: 'Alertas e cuidados', text: 'Contraindicações, efeitos adversos e superdose.' },
                    { icon: Package, title: 'Apresentações', text: 'Concentrações disponíveis e armazenamento.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4">
                      <item.icon className="text-teal-800 dark:text-teal-500" size={18} />
                      <p className="mt-3 text-sm font-bold text-stone-900 dark:text-stone-100">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">{item.text}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="gestao" className="relative isolate overflow-hidden border-y border-stone-200 bg-[oklch(0.985_0.01_95)] py-24 dark:border-stone-800 dark:bg-stone-950 md:py-32">
          <div className="surface-pattern pointer-events-none absolute inset-0 z-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal direction="up">
              <div className="mx-auto max-w-2xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-stone-800 dark:text-stone-100">
                  <span className="size-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                  Clínica organizada
                </span>
                <h2 className="font-display mt-5 text-3xl font-bold tracking-[-0.06em] text-stone-900 dark:text-stone-100 sm:text-4xl md:text-5xl">
                  <TextReveal text="Toda a operação em um lugar só." />
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-stone-500 dark:text-stone-400 md:text-lg">
                  Pets, tutores, vacinas, pagamentos e agendamentos conversam entre si. O que você registra em um módulo aparece onde a equipe precisa.
                </p>
              </div>
            </Reveal>

            <Reveal direction="up" delay={120}>
              <div className="mx-auto mt-14 max-w-4xl">
                <ManagementDemo />
              </div>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: PawPrint, title: 'Pets e tutores', text: 'Ficha completa, histórico e vínculo entre tutor e paciente.' },
                { icon: Syringe, title: 'Vacinas', text: 'Carteira digital com controle de reforço e próxima dose.' },
                { icon: CreditCard, title: 'Pagamentos', text: 'Cobranças, orçamentos e status financeiro por atendimento.' },
                { icon: CalendarDays, title: 'Agendamentos', text: 'Agenda da equipe com confirmação e tipo de atendimento.' },
              ].map((item, index) => (
                <Reveal key={item.title} direction="up" delay={index * 70}>
                  <div className="h-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
                    <span className="grid size-10 place-items-center rounded-xl bg-stone-100 dark:bg-stone-800 text-teal-800 dark:text-teal-500"><item.icon size={18} /></span>
                    <p className="mt-4 text-sm font-bold text-stone-900 dark:text-stone-100">{item.title}</p>
                    <p className="mt-1.5 text-xs leading-5 text-stone-500 dark:text-stone-400">{item.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="receita" className="relative isolate overflow-hidden bg-white py-24 dark:bg-stone-950 md:py-32">
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <Reveal direction="up">
                <SectionHeading eyebrow="Receita em segundos" title="Prescreveu, está pronta para imprimir." description="Monte a prescrição no atendimento e o VetAI gera o documento timbrado. Só falta baixar o PDF." />
                <div className="mt-8 space-y-5">
                  {[
                    { title: 'Escolha os medicamentos', text: 'Busque no bulário e a posologia já vem sugerida.' },
                    { title: 'Ajuste a posologia', text: 'Dose, via, intervalo e duração conforme o caso.' },
                    { title: 'Baixe o PDF', text: 'Timbrado da clínica, dados do paciente, CRMV e assinatura.' },
                  ].map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <span className="font-data grid size-8 shrink-0 place-items-center rounded-full border border-teal-800/20 dark:border-teal-500/20 text-xs font-bold text-teal-800 dark:text-teal-500">{index + 1}</span>
                      <div>
                        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">{step.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-stone-500 dark:text-stone-400">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-800 bg-[oklch(0.985_0.01_95)] dark:bg-stone-900 px-4 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
                  <FileText size={14} className="text-teal-800 dark:text-teal-500" />
                  Também disponível para orçamentos e relatórios de internação
                </div>
              </Reveal>

              <Reveal direction="up" delay={150}>
                <Shot tilt="left" className="mx-auto w-full max-w-[520px]">
                  <PrescriptionDemo />
                </Shot>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="internacao" className="relative isolate overflow-hidden bg-stone-900 py-24 text-stone-100 md:py-32">
          <div className="surface-pattern pointer-events-none absolute inset-y-0 left-0 z-0 w-1/2 opacity-20 [mask-image:linear-gradient(to_right,black,transparent)]" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <Reveal direction="up">
                <Shot tilt="right" className="mx-auto w-full max-w-[540px]">
                  <HospitalizationDemo />
                </Shot>
              </Reveal>

              <Reveal direction="up" delay={120}>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-stone-100">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  Internação
                </span>
                <h2 className="font-display mt-5 text-3xl font-bold tracking-[-0.06em] sm:text-4xl md:text-5xl">
                  <TextReveal text="O plantão inteiro sabe o que já foi feito." />
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-stone-400 md:text-lg">
                  Admissão, prescrição, mapa de execuções e sinais vitais no mesmo lugar. Quem entra no turno vê exatamente onde o cuidado parou.
                </p>

                <div className="mt-9 space-y-px overflow-hidden rounded-2xl border border-white/10">
                  {[
                    { icon: BedDouble, title: 'Admissão e box', text: 'Status, risco e evolução clínica desde a entrada.' },
                    { icon: Syringe, title: 'Prescrição recorrente', text: 'Dose, intervalo e duração viram horários no mapa.' },
                    { icon: Check, title: 'Execuções registradas', text: 'Cada dose aplicada fica marcada com autor e horário.' },
                    { icon: Activity, title: 'Sinais vitais e alertas', text: 'Aferição no intervalo definido, com aviso de atraso.' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4 bg-white/[0.03] px-5 py-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-teal-400"><item.icon size={17} /></span>
                      <div>
                        <p className="text-sm font-bold text-stone-100">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-stone-400">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="planos" className="relative isolate overflow-hidden bg-white py-24 dark:bg-stone-950 md:py-32">
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal direction="up"><SectionHeading eyebrow="Planos que acompanham" title="Comece com a sua clínica. Cresça no seu ritmo." description="Escolha a estrutura que faz sentido hoje. Os planos crescem junto com a operação." /></Reveal>
            {plansLoading ? (
              <div className="mt-14 grid gap-5 md:grid-cols-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="rounded-[24px] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-7">
                    <Skeleton className="h-7 w-2/5" />
                    <Skeleton className="mt-4 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-4/5" />
                    <Skeleton className="mt-7 h-9 w-1/2" />
                    <Skeleton className="mt-8 h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : plans.length > 0 ? (
              <div className="mt-14 grid gap-5 md:grid-cols-3">
                {plans.map((plan, index) => (
                  <Reveal key={plan.id} direction="up" delay={index * 80}>
                    <article className={`relative flex h-full flex-col rounded-[24px] border p-7 ${plan.highlighted ? 'border-teal-800 dark:border-teal-500 bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 shadow-[var(--shadow-brand)]' : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-[var(--shadow-card)]'}`}>
                      {plan.highlighted && <span className="absolute -top-3 left-6 rounded-full bg-amber-500 dark:bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-100">Mais escolhido</span>}
                      <h3 className="font-display text-2xl font-bold tracking-[-0.05em]">{plan.name}</h3>
                      <p className={`mt-2 text-sm leading-6 ${plan.highlighted ? 'text-white/75 dark:text-stone-950/75' : 'text-stone-500 dark:text-stone-400'}`}>{plan.description}</p>
                      <div className="mt-7"><span className="font-data text-3xl font-semibold tracking-[-0.08em]">{formatPrice(plan.monthlyPrice)}</span>{plan.billingMode === 'subscription' && <span className={`ml-1 text-sm ${plan.highlighted ? 'text-white/70 dark:text-stone-950/70' : 'text-stone-500 dark:text-stone-400'}`}>/mês</span>}</div>
                      <ul className="mt-7 flex-1 space-y-3">
                        <li className="flex gap-2 text-sm"><Check size={17} className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />Até {plan.userLimit} {plan.userLimit === 1 ? 'usuário' : 'usuários'}</li>
                        <li className="flex gap-2 text-sm"><Check size={17} className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />{plan.aiCredits} créditos de IA por mês</li>
                        {plan.features.map((feature) => <li key={feature.key} className="flex gap-2 text-sm"><Check size={17} className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />{feature.label}</li>)}
                      </ul>
                      <Button asChild variant={plan.highlighted ? 'secondary' : 'default'} className="mt-8 w-full"><Link href={`/register?plan_id=${plan.id}`}>Escolher plano <ChevronRight /></Link></Button>
                    </article>
                  </Reveal>
                ))}
              </div>
            ) : <div className="mt-12 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-100/40 dark:bg-stone-800/40 p-8 text-center text-sm text-stone-500 dark:text-stone-400">Os planos estarão disponíveis em instantes.</div>}
          </div>
        </section>

        <section id="relatos" className="relative isolate overflow-hidden border-y border-stone-200 bg-[oklch(0.985_0.01_95)] py-24 dark:border-stone-800 dark:bg-stone-900 md:py-32">
          <div className="surface-pattern pointer-events-none absolute inset-y-0 left-0 z-0 w-1/2 opacity-35 [mask-image:linear-gradient(to_right,black,transparent)]" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal direction="up"><SectionHeading eyebrow="Quem usa, sente" title="Mais presença para o que importa." /></Reveal>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((testimonial, index) => (
                <Reveal key={testimonial.name} direction="up" delay={index * 80}>
                  <blockquote className="flex h-full flex-col rounded-[24px] border border-stone-200 dark:border-stone-800 bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 p-7">
                    <Quote className="text-amber-500 dark:text-amber-400" size={28} />
                    <p className="mt-5 flex-1 text-base leading-7 text-stone-900 dark:text-stone-100">“{testimonial.quote}”</p>
                    <footer className="mt-8 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-teal-800 dark:bg-teal-500 text-xs font-bold text-white dark:text-stone-950">{testimonial.initials}</span><div><cite className="not-italic text-sm font-bold">{testimonial.name}</cite><p className="text-xs text-stone-500 dark:text-stone-400">{testimonial.role}</p></div></footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-teal-800 dark:bg-teal-500 py-24 text-white dark:text-stone-950 md:py-28">
          <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <Reveal direction="up"><div><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold"><ShieldCheck size={14} /> Clínica, dados e cuidado no mesmo lugar</div><h2 className="font-display mt-6 max-w-2xl text-4xl font-bold leading-none tracking-[-0.07em] sm:text-5xl">Sua equipe mais presente em cada decisão clínica.</h2><p className="mt-5 max-w-xl text-lg leading-7 text-white/75 dark:text-stone-950/75">Organize a rotina hoje e construa uma experiência de cuidado mais consistente amanhã.</p></div></Reveal>
              <Reveal direction="up" delay={100}><Button asChild size="lg" className="h-12 bg-amber-700 dark:bg-amber-300 px-7 text-base text-white dark:text-stone-950 shadow-none hover:bg-amber-700/90 dark:hover:bg-amber-300/90"><Link href="/register">Criar conta gratuita <ArrowRight /></Link></Button></Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"><BrandLogo /><p className="text-xs text-stone-500 dark:text-stone-400">© 2026 VetAI. Tecnologia que acompanha o cuidado.</p><div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400"><ChartNoAxesCombined size={14} className="text-teal-800 dark:text-teal-500" /> Gestão veterinária inteligente</div></div>
      </footer>
    </div>
  );
}
