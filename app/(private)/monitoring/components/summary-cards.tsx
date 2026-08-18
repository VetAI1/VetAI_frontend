'use client';

import { AlarmClockOff, CalendarCheck, PawPrint, Stethoscope } from 'lucide-react';

import type { MonitoringSummary } from '@/types/monitoring';

interface SummaryCardsProps {
  summary: MonitoringSummary | null;
  loading?: boolean;
}

const ICON_CLASS =
  'text-primary bg-primary/10';

const CARDS = [
  {
    key: 'hospitalized' as const,
    label: 'Internados agora',
    icon: PawPrint,
  },
  {
    key: 'triage' as const,
    label: 'Em triagem',
    icon: Stethoscope,
  },
  {
    key: 'expected_discharges_today' as const,
    label: 'Altas previstas hoje',
    icon: CalendarCheck,
  },
  {
    key: 'late_executions' as const,
    label: 'Tarefas atrasadas',
    icon: AlarmClockOff,
  },
];

export function SummaryCards({ summary, loading = false }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {CARDS.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-3"
        >
          <div className={`p-2.5 rounded-lg shrink-0 ${ICON_CLASS}`}>
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            {loading ? (
              <div className="h-7 w-10 bg-muted rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-foreground leading-tight">
                {summary?.[key] ?? 0}
              </p>
            )}
            <p className="text-xs text-muted-foreground truncate">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
