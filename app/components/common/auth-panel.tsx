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
    <aside className="relative hidden overflow-hidden bg-primary lg:flex lg:w-1/2">
      <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -right-24 top-28 size-72 rounded-full border border-white/15" />
      <div className="absolute -bottom-20 -left-16 size-72 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col justify-between px-12 xl:px-16 py-12 w-full">
        <Link href="/" aria-label="VetAI - início">
          <BrandLogo light />
        </Link>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-brand-sun">
            Gestão veterinária inteligente
          </p>
          <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-[-0.06em] text-white xl:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-10">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.08] p-4"
                >
                  <Icon size={20} className="mb-2 text-brand-sun" />
                  <div className="font-data text-2xl font-semibold text-white">
                    <Counter
                      target={stat.value}
                      duration={2000}
                      suffix={stat.suffix}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-white/60">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className="size-2 rounded-full bg-brand-sun" />
            Criptografia de ponta a ponta
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <div className="size-2 rounded-full bg-brand-sun" />
            LGPD Compliant
          </div>
        </div>
      </div>
    </aside>
  );
}
