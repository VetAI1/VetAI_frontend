'use client';

import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  ClipboardPlus,
  FileText,
  HeartPulse,
  PawPrint,
  Quote,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BrandLogo } from '@/app/components/brand/brand-logo';
import { Counter } from '@/app/components/common/counter';
import { Reveal } from '@/app/components/common/reveal';
import { Button } from '@/components/ui/button';
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
      <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-secondary-foreground">
        <span className="size-1.5 rounded-full bg-[var(--brand-sun)]" />
        {eyebrow}
      </span>
      <h2 className="font-display mt-5 text-3xl font-bold tracking-[-0.06em] text-foreground sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    void billingService
      .listPlans()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="VetAI - início">
            <BrandLogo />
          </Link>
          <div className="hidden items-center gap-7 lg:flex">
            <a className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary" href="#produto">
              Produto
            </a>
            <a className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary" href="#planos">
              Planos
            </a>
            <a className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary" href="#relatos">
              Relatos
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="px-4 sm:px-5">
              <Link href="/register">Criar conta <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative isolate pt-32 pb-16 sm:pt-40 md:pb-24">
          <div className="surface-pattern absolute inset-x-0 top-0 -z-10 h-[540px] opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="absolute -z-10 right-[7%] top-32 hidden size-40 rounded-full border border-primary/15 bg-secondary/50 md:block" />
          <div className="absolute -z-10 left-[8%] top-64 hidden size-12 rounded-full bg-[var(--brand-sun)]/65 md:block" />
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="max-w-2xl">
                <Reveal direction="up">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
                    <PawPrint size={14} />
                    Tecnologia que acompanha o cuidado
                  </div>
                </Reveal>
                <Reveal direction="up" delay={80}>
                  <h1 className="font-display mt-6 text-5xl font-bold leading-[0.98] tracking-[-0.075em] text-foreground sm:text-6xl lg:text-7xl">
                    Gestão clínica que{' '}
                    <span className="text-primary">cuida do seu tempo.</span>
                  </h1>
                </Reveal>
                <Reveal direction="up" delay={160}>
                  <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
                    Prontuário, exames e acompanhamento inteligente para a sua equipe ter mais clareza e cada paciente receber mais atenção.
                  </p>
                </Reveal>
                <Reveal direction="up" delay={240}>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" className="h-12 px-7 text-base">
                      <Link href="/register">Começar sem compromisso <ArrowRight /></Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-12 px-7 text-base">
                      <a href="#produto">Conhecer a plataforma</a>
                    </Button>
                  </div>
                </Reveal>
                <Reveal direction="up" delay={320}>
                  <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                      {['AP', 'CM', 'MC'].map((initials, index) => (
                        <span key={initials} className={`grid size-8 place-items-center rounded-full border-2 border-background text-[10px] font-bold text-primary-foreground ${index === 1 ? 'bg-[var(--brand-sun)] text-accent-foreground' : 'bg-primary'}`}>
                          {initials}
                        </span>
                      ))}
                    </div>
                    Feito para a rotina de clínicas e hospitais veterinários.
                  </div>
                </Reveal>
              </div>

              <Reveal direction="up" delay={180}>
                <div className="relative mx-auto w-full max-w-[560px]">
                  <div className="absolute -inset-5 -z-10 rounded-[40px] border border-primary/10 bg-secondary/70 -rotate-3" />
                  <div className="overflow-hidden rounded-[28px] border border-border bg-card p-3 shadow-[var(--shadow-card)] sm:p-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <BrandLogo compact className="scale-90 origin-left" />
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">Hoje</span>
                    </div>
                    <div className="grid gap-3 pt-4 sm:grid-cols-[1.2fr_0.8fr]">
                      <div className="rounded-2xl bg-secondary/60 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground">Paciente em acompanhamento</p>
                            <p className="font-display mt-1 text-xl font-bold tracking-[-0.05em]">Luna</p>
                          </div>
                          <div className="grid size-10 place-items-center rounded-2xl bg-[var(--brand-sun)] text-accent-foreground"><PawPrint size={19} /></div>
                        </div>
                        <div className="mt-5 flex items-end gap-1.5" aria-label="Evolução estável">
                          {[31, 42, 37, 54, 49, 65, 73].map((height, index) => (
                            <span key={index} className="w-full rounded-full bg-primary/20" style={{ height: `${height / 2}px` }}>
                              <span className="block h-[52%] rounded-full bg-primary" />
                            </span>
                          ))}
                        </div>
                        <p className="mt-3 text-xs font-semibold text-primary">Sinais estáveis nas últimas 24h</p>
                      </div>
                      <div className="rounded-2xl border border-border p-4">
                        <p className="text-xs font-semibold text-muted-foreground">Próximo atendimento</p>
                        <p className="font-data mt-3 text-2xl font-semibold text-foreground">14:30</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays size={14} /> Retorno clínico</div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-2xl border border-border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-secondary text-primary"><BrainCircuit size={16} /></span><p className="text-sm font-bold">Leitura assistida por IA</p></div>
                        <span className="font-data text-xs font-semibold text-primary">98%</span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">Resultados organizados, contexto do paciente e observações prontas para a sua revisão.</p>
                    </div>
                  </div>
                  <div className="absolute -right-5 top-12 hidden rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)] lg:block">
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-xl bg-[var(--brand-sun)] text-accent-foreground"><HeartPulse size={16} /></span>
                      <div><p className="text-[10px] font-semibold text-muted-foreground">Acompanhamento</p><p className="text-xs font-bold text-foreground">Sinais estáveis</p></div>
                    </div>
                  </div>
                  <div className="absolute -bottom-5 -left-7 hidden rounded-2xl border border-border bg-card px-3 py-2.5 shadow-[var(--shadow-card)] lg:flex lg:items-center lg:gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-secondary text-primary"><PawPrint size={14} /></span>
                    <span className="text-xs font-bold text-foreground">Luna · retorno em dia</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0 px-5 sm:px-8">
            {[
              { value: 2500, suffix: '+', label: 'veterinários ativos' },
              { value: 50000, suffix: '+', label: 'exames organizados' },
              { value: 15, suffix: ' mil+', label: 'pacientes acompanhados' },
              { value: 24, suffix: 'h', label: 'visão da clínica' },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-7 text-center sm:px-7">
                <p className="font-data text-2xl font-semibold tracking-[-0.07em] text-primary sm:text-3xl"><Counter target={stat.value} suffix={stat.suffix} /></p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="produto" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
          <Reveal direction="up"><SectionHeading eyebrow="Uma rotina mais fluida" title="Clínico na essência. Simples na rotina." description="Cada ferramenta foi organizada para apoiar a tomada de decisão e reduzir o trabalho repetitivo da equipe." /></Reveal>
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} direction="up" delay={index * 100}>
                <article className="group h-full rounded-[24px] border border-border bg-card p-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25">
                  <div className={`grid size-12 place-items-center rounded-2xl ${index === 1 ? 'bg-[var(--brand-sun)] text-accent-foreground' : 'bg-secondary text-primary'}`}><feature.icon size={23} /></div>
                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.12em] text-primary">{feature.eyebrow}</p>
                  <h3 className="font-display mt-3 text-2xl font-bold tracking-[-0.05em] text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-secondary/35 py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <Reveal direction="up"><SectionHeading eyebrow="Do exame à conduta" title="Tecnologia presente. Decisão sempre sua." description="O VetAI organiza dados e destaca contexto. Quem cuida, interpreta e decide continua sendo você." /></Reveal>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: FileText, title: 'Envie', text: 'Exames e documentos chegam ao prontuário.' },
                  { icon: Sparkles, title: 'Revise', text: 'A IA estrutura leituras para sua avaliação.' },
                  { icon: Stethoscope, title: 'Cuide', text: 'Registre a conduta e acompanhe a evolução.' },
                ].map((step, index) => (
                  <Reveal key={step.title} direction="up" delay={index * 100}>
                    <div className="relative h-full rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <span className="font-data text-xs font-semibold text-primary">0{index + 1}</span>
                      <step.icon className="mt-8 text-primary" size={24} />
                      <h3 className="font-display mt-5 text-xl font-bold tracking-[-0.05em]">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="planos" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
          <Reveal direction="up"><SectionHeading eyebrow="Planos que acompanham" title="Comece com a sua clínica. Cresça no seu ritmo." description="Escolha a estrutura que faz sentido hoje. Os planos crescem junto com a operação." /></Reveal>
          {plans.length > 0 ? (
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {plans.map((plan, index) => (
                <Reveal key={plan.id} direction="up" delay={index * 100}>
                  <article className={`relative flex h-full flex-col rounded-[24px] border p-7 ${plan.highlighted ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-brand)]' : 'border-border bg-card shadow-[var(--shadow-card)]'}`}>
                    {plan.highlighted && <span className="absolute -top-3 left-6 rounded-full bg-[var(--brand-sun)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">Mais escolhido</span>}
                    <h3 className="font-display text-2xl font-bold tracking-[-0.05em]">{plan.name}</h3>
                    <p className={`mt-2 text-sm leading-6 ${plan.highlighted ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{plan.description}</p>
                    <div className="mt-7"><span className="font-data text-3xl font-semibold tracking-[-0.08em]">{formatPrice(plan.monthlyPrice)}</span>{plan.billingMode === 'subscription' && <span className={`ml-1 text-sm ${plan.highlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>/mês</span>}</div>
                    <ul className="mt-7 flex-1 space-y-3">
                      <li className="flex gap-2 text-sm"><Check size={17} className="mt-0.5 shrink-0 text-[var(--brand-sun)]" />Até {plan.userLimit} {plan.userLimit === 1 ? 'usuário' : 'usuários'}</li>
                      <li className="flex gap-2 text-sm"><Check size={17} className="mt-0.5 shrink-0 text-[var(--brand-sun)]" />{plan.aiCredits} créditos de IA por mês</li>
                      {plan.features.map((feature) => <li key={feature.key} className="flex gap-2 text-sm"><Check size={17} className="mt-0.5 shrink-0 text-[var(--brand-sun)]" />{feature.label}</li>)}
                    </ul>
                    <Button asChild variant={plan.highlighted ? 'secondary' : 'default'} className="mt-8 w-full"><Link href={`/register?plan_id=${plan.id}`}>Escolher plano <ChevronRight /></Link></Button>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : <div className="mt-12 rounded-2xl border border-dashed border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">Os planos estarão disponíveis em instantes.</div>}
        </section>

        <section id="relatos" className="border-y border-border bg-card py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal direction="up"><SectionHeading eyebrow="Quem usa, sente" title="Mais presença para o que importa." /></Reveal>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((testimonial, index) => (
                <Reveal key={testimonial.name} direction="up" delay={index * 100}>
                  <blockquote className="flex h-full flex-col rounded-[24px] border border-border bg-background p-7">
                    <Quote className="text-[var(--brand-sun)]" size={28} />
                    <p className="mt-5 flex-1 text-base leading-7 text-foreground">“{testimonial.quote}”</p>
                    <footer className="mt-8 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{testimonial.initials}</span><div><cite className="not-italic text-sm font-bold">{testimonial.name}</cite><p className="text-xs text-muted-foreground">{testimonial.role}</p></div></footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground md:py-28">
          <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold"><ShieldCheck size={14} /> Clínica, dados e cuidado no mesmo lugar</div><h2 className="font-display mt-6 max-w-2xl text-4xl font-bold leading-none tracking-[-0.07em] sm:text-5xl">Sua equipe mais presente em cada decisão clínica.</h2><p className="mt-5 max-w-xl text-lg leading-7 text-primary-foreground/75">Organize a rotina hoje e construa uma experiência de cuidado mais consistente amanhã.</p></div>
              <Button asChild size="lg" className="h-12 bg-[var(--brand-sun)] px-7 text-base text-primary-foreground shadow-none hover:bg-[var(--brand-sun)]/90"><Link href="/register">Criar conta gratuita <ArrowRight /></Link></Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"><BrandLogo /><p className="text-xs text-muted-foreground">© 2026 VetAI. Tecnologia que acompanha o cuidado.</p><div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><ChartNoAxesCombined size={14} className="text-primary" /> Gestão veterinária inteligente</div></div>
      </footer>
    </div>
  );
}
