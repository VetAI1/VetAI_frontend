import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/app/components/common/card';

// O tom acompanha o valor do card, não a posição dele: cor só aparece quando
// significa alguma coisa. Campo sem dado cai sempre em `neutral`, então um
// paciente vivo, sem chip e sem sexo informado fica quase todo neutro.
const TONES = {
  accent: {
    badge: 'bg-teal-50 dark:bg-teal-950/50',
    icon: 'text-teal-600 dark:text-teal-400',
  },
  neutral: {
    badge: 'bg-slate-100 dark:bg-slate-700/50',
    icon: 'text-slate-500 dark:text-slate-400',
  },
  positive: {
    badge: 'bg-emerald-50 dark:bg-emerald-950/50',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  danger: {
    badge: 'bg-red-50 dark:bg-red-950/50',
    icon: 'text-red-600 dark:text-red-400',
  },
  male: {
    badge: 'bg-sky-50 dark:bg-sky-950/50',
    icon: 'text-sky-600 dark:text-sky-400',
  },
  female: {
    badge: 'bg-pink-50 dark:bg-pink-950/50',
    icon: 'text-pink-600 dark:text-pink-400',
  },
} as const;

export type InfoCardTone = keyof typeof TONES;

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: InfoCardTone;
  className?: string;
}

export function InfoCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = 'accent',
  className,
}: InfoCardProps) {
  const { badge, icon } = TONES[tone];

  return (
    <Card
      className={`px-3 py-4 flex items-start gap-2.5${className ? ` ${className}` : ''}`}
    >
      <div
        className={`w-9 h-9 rounded-lg ${badge} flex items-center justify-center shrink-0`}
      >
        <Icon size={16} className={icon} />
      </div>
      <div className="min-w-0 pl-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        {value}
        {sub && (
          <div
            className={`text-xs text-slate-500 dark:text-slate-400${typeof sub === 'string' ? ' truncate' : ''}`}
          >
            {sub}
          </div>
        )}
      </div>
    </Card>
  );
}
