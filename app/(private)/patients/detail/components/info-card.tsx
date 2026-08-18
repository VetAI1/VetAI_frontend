import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/app/components/common/card';

// O tom acompanha o valor do card, não a posição dele: cor só aparece quando
// significa alguma coisa. Campo sem dado cai sempre em `neutral`, então um
// paciente vivo, sem chip e sem sexo informado fica quase todo neutro.
const TONES = {
  accent: {
    badge: 'bg-primary/10',
    icon: 'text-primary',
  },
  neutral: {
    badge: 'bg-secondary',
    icon: 'text-muted-foreground',
  },
  positive: {
    badge: 'bg-success-soft',
    icon: 'text-success',
  },
  danger: {
    badge: 'bg-danger-soft',
    icon: 'text-danger',
  },
  male: {
    badge: 'bg-info-soft',
    icon: 'text-info',
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
        <p className="text-xs text-muted-foreground">{label}</p>
        {value}
        {sub && (
          <div
            className={`text-xs text-muted-foreground${typeof sub === 'string' ? ' truncate' : ''}`}
          >
            {sub}
          </div>
        )}
      </div>
    </Card>
  );
}
