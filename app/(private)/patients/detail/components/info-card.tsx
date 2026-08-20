import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/app/components/common/card';

// O tom acompanha o valor do card, não a posição dele: cor só aparece quando
// significa alguma coisa. Campo sem dado cai sempre em `neutral`, então um
// paciente vivo, sem chip e sem sexo informado fica quase todo neutro.
const TONES = {
  accent: {
    badge: 'bg-teal-800/10 dark:bg-teal-500/10',
    icon: 'text-teal-800 dark:text-teal-500',
  },
  neutral: {
    badge: 'bg-stone-100 dark:bg-stone-800',
    icon: 'text-stone-500 dark:text-stone-400',
  },
  positive: {
    badge: 'bg-emerald-50 dark:bg-emerald-900',
    icon: 'text-emerald-700 dark:text-emerald-500',
  },
  danger: {
    badge: 'bg-red-50 dark:bg-red-900',
    icon: 'text-red-600 dark:text-red-500',
  },
  male: {
    badge: 'bg-sky-50 dark:bg-sky-900',
    icon: 'text-sky-700 dark:text-sky-500',
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
        <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
        {value}
        {sub && (
          <div
            className={`text-xs text-stone-500 dark:text-stone-400${typeof sub === 'string' ? ' truncate' : ''}`}
          >
            {sub}
          </div>
        )}
      </div>
    </Card>
  );
}
