'use client';

import {
  ArrowRight,
  BedDouble,
  BrainCircuit,
  ChevronDown,
  ClipboardPlus,
  FileSignature,
  LayoutGrid,
  Menu,
  Pill,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { BrandLogo } from '@/app/components/brand/brand-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/infra/utils';

interface NavItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const RESOURCES: NavItem[] = [
  {
    id: 'produto',
    label: 'Prontuário',
    description: 'Histórico, peso, vacinas e anotações clínicas.',
    icon: ClipboardPlus,
  },
  {
    id: 'ia',
    label: 'Exames com IA',
    description: 'Leituras organizadas para apoiar sua decisão.',
    icon: BrainCircuit,
  },
  {
    id: 'medicamentos',
    label: 'Bulário',
    description: 'Dose por espécie, vias e contraindicações.',
    icon: Pill,
  },
  {
    id: 'gestao',
    label: 'Gestão da clínica',
    description: 'Pets, tutores, vacinas, pagamentos e agenda.',
    icon: LayoutGrid,
  },
  {
    id: 'receita',
    label: 'Receitas',
    description: 'Prescrição pronta para baixar em PDF.',
    icon: FileSignature,
  },
  {
    id: 'internacao',
    label: 'Internação',
    description: 'Mapa de execuções e sinais vitais no plantão.',
    icon: BedDouble,
  },
];

const DIRECT_LINKS = [
  { id: 'planos', label: 'Planos' },
  { id: 'relatos', label: 'Relatos' },
];

const SPY_IDS = [...RESOURCES.map((item) => item.id), 'planos', 'relatos'];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = SPY_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!resourcesOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!resourcesRef.current?.contains(event.target as Node)) {
        setResourcesOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setResourcesOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [resourcesOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const resourcesActive = RESOURCES.some((item) => item.id === activeSection);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none',
        scrolled
          ? 'border-b border-stone-200/80 bg-[oklch(0.985_0.01_95)]/80 shadow-[0_1px_16px_-8px_oklch(0_0_0/0.25)] backdrop-blur-xl dark:border-stone-800/80 dark:bg-stone-950/80'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav
        aria-label="Principal"
        className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        <Link href="/" aria-label="VetAI - início" className="shrink-0">
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <div ref={resourcesRef} className="relative">
            <button
              type="button"
              onClick={() => setResourcesOpen((open) => !open)}
              aria-expanded={resourcesOpen}
              aria-haspopup="true"
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200',
                resourcesOpen || resourcesActive
                  ? 'bg-stone-100 text-teal-800 dark:bg-stone-800 dark:text-teal-500'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100',
              )}
            >
              Recursos
              <ChevronDown
                size={14}
                className={cn(
                  'transition-transform duration-200 motion-reduce:transition-none',
                  resourcesOpen && 'rotate-180',
                )}
              />
            </button>

            {resourcesOpen && (
              <div className="animate-in absolute left-1/2 top-[calc(100%+10px)] w-[560px] -translate-x-1/2 rounded-2xl border border-stone-200 bg-white p-2.5 shadow-[var(--shadow-card)] fade-in slide-in-from-top-1 duration-200 [animation-timing-function:var(--ease-brand)] dark:border-stone-800 dark:bg-stone-900">
                <div className="grid grid-cols-2 gap-1">
                  {RESOURCES.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setResourcesOpen(false)}
                      className={cn(
                        'group flex gap-3 rounded-xl p-3 transition-colors duration-200',
                        activeSection === item.id
                          ? 'bg-stone-100 dark:bg-stone-800'
                          : 'hover:bg-stone-100 dark:hover:bg-stone-800',
                      )}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-stone-100 text-teal-800 transition-colors duration-200 group-hover:bg-white dark:bg-stone-800 dark:text-teal-500 dark:group-hover:bg-stone-900">
                        <item.icon size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-stone-900 dark:text-stone-100">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-stone-500 dark:text-stone-400">
                          {item.description}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {DIRECT_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200',
                activeSection === link.id
                  ? 'bg-stone-100 text-teal-800 dark:bg-stone-800 dark:text-teal-500'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100',
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm" className="px-4 sm:px-5">
            <Link href="/register">
              Criar conta <ArrowRight />
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
            className="grid size-9 place-items-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 lg:hidden"
          >
            <Menu size={19} />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-in absolute inset-0 bg-stone-950/40 fade-in duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="animate-in absolute inset-x-0 top-0 max-h-dvh overflow-y-auto border-b border-stone-200 bg-[oklch(0.985_0.01_95)] p-5 slide-in-from-top-4 duration-300 [animation-timing-function:var(--ease-brand)] dark:border-stone-800 dark:bg-stone-950">
            <div className="flex h-[32px] items-center justify-between">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="grid size-9 place-items-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
              Recursos
            </p>
            <div className="mt-3 space-y-1">
              {RESOURCES.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-stone-100 text-teal-800 dark:bg-stone-800 dark:text-teal-500">
                    <item.icon size={17} />
                  </span>
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-5 space-y-1 border-t border-stone-200 pt-5 dark:border-stone-800">
              {DIRECT_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-bold text-stone-900 hover:bg-stone-100 dark:text-stone-100 dark:hover:bg-stone-800"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2.5 border-t border-stone-200 pt-6 dark:border-stone-800">
              <Button asChild variant="outline" size="lg">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Entrar
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  Criar conta <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
