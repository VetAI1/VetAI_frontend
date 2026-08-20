'use client';

import {
  Microscope,
  PawPrint,
  Stethoscope,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { BrandLogo } from '@/app/components/brand/brand-logo';
import { Counter } from '@/app/components/common/counter';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  { icon: Users, value: 2500, suffix: '+', label: 'Veterinários ativos' },
  { icon: Microscope, value: 18000, suffix: '+', label: 'Exames analisados' },
  {
    icon: Stethoscope,
    value: 45000,
    suffix: '+',
    label: 'Consultas realizadas',
  },
  { icon: PawPrint, value: 32000, suffix: '+', label: 'Pets registrados' },
];

interface AuthPanelProps {
  title: string;
  description: string;
}

export function AuthPanel({ title, description }: AuthPanelProps) {
  return (
    <aside className="relative hidden min-h-0 overflow-hidden bg-teal-800 dark:bg-teal-500 lg:flex">
      <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(var(--color-white)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -right-24 top-24 size-80 rounded-full border border-white/15 dark:border-stone-950/15" />
      <div className="absolute right-12 top-40 size-32 rounded-full border border-white/10 dark:border-stone-950/10" />
      <div className="absolute -bottom-24 -left-20 size-96 rounded-full bg-white/5 dark:bg-stone-950/5" />
      <div className="absolute -bottom-16 left-24 size-56 rounded-full border border-amber-500/25 dark:border-amber-400/25" />

      <div className="relative z-10 flex w-full flex-col justify-between px-12 py-12 xl:px-16">
        <Link href="/" aria-label="VetAI - início">
          <BrandLogo light />
        </Link>

        <div className="max-w-lg">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white dark:text-stone-950">
            <span className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 dark:bg-amber-400/20">
              <span className="size-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            </span>
            Gestão veterinária inteligente
          </p>
          <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.06em] text-white dark:text-stone-950 xl:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/80 dark:text-stone-950/80">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-10">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/15 dark:border-stone-950/15 bg-white/10 dark:bg-stone-950/10 p-4 shadow-[var(--shadow-brand)]"
                >
                  <span className="mb-3 flex size-8 items-center justify-center rounded-lg bg-white/10 dark:bg-stone-950/10 text-amber-500 dark:text-amber-400">
                    <Icon size={17} />
                  </span>
                  <div className="font-data text-2xl font-semibold tracking-[-0.06em] text-white dark:text-stone-950">
                    <Counter
                      target={stat.value}
                      duration={2000}
                      suffix={stat.suffix}
                    />
                  </div>
                  <p className="mt-1 text-xs text-white/70 dark:text-stone-950/70">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/15 dark:border-stone-950/15 pt-6 text-xs text-white/75 dark:text-stone-950/75">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-amber-500 dark:bg-amber-400 ring-4 ring-amber-500/10 dark:ring-amber-400/10" />
            Organização para a rotina clínica
          </div>
          <span className="font-data text-white/55 dark:text-stone-950/55">VETAI</span>
        </div>
      </div>
    </aside>
  );
}
