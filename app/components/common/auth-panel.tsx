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
    <aside className="relative hidden min-h-0 overflow-hidden bg-primary lg:flex">
      <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(var(--primary-foreground)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -right-24 top-24 size-80 rounded-full border border-primary-foreground/15" />
      <div className="absolute right-12 top-40 size-32 rounded-full border border-primary-foreground/10" />
      <div className="absolute -bottom-24 -left-20 size-96 rounded-full bg-primary-foreground/5" />
      <div className="absolute -bottom-16 left-24 size-56 rounded-full border border-brand-sun/25" />

      <div className="relative z-10 flex w-full flex-col justify-between px-12 py-12 xl:px-16">
        <Link href="/" aria-label="VetAI - início">
          <BrandLogo light />
        </Link>

        <div className="max-w-lg">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-brand-sun/20">
              <span className="size-1.5 rounded-full bg-brand-sun" />
            </span>
            Gestão veterinária inteligente
          </p>
          <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.06em] text-primary-foreground xl:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-primary-foreground/80">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-10">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-4 shadow-[var(--shadow-brand)]"
                >
                  <span className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary-foreground/10 text-brand-sun">
                    <Icon size={17} />
                  </span>
                  <div className="font-data text-2xl font-semibold tracking-[-0.06em] text-primary-foreground">
                    <Counter
                      target={stat.value}
                      duration={2000}
                      suffix={stat.suffix}
                    />
                  </div>
                  <p className="mt-1 text-xs text-primary-foreground/70">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/75">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-sun ring-4 ring-brand-sun/10" />
            Organização para a rotina clínica
          </div>
          <span className="font-data text-primary-foreground/55">VETAI</span>
        </div>
      </div>
    </aside>
  );
}
