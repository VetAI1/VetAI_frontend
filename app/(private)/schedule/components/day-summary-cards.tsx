'use client';

import {
  Activity,
  CalendarDays,
  ClipboardList,
  Microscope,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/infra/utils';
import { EVENT_TYPE_MAP } from '@/types/schedule';
import type { EventType, ScheduleEvent } from '@/types/schedule';

const ICON_BY_TYPE: Record<EventType, LucideIcon> = {
  consultation: Stethoscope,
  surgery: Activity,
  vaccine: Syringe,
  exam: Microscope,
  other: ClipboardList,
};

const CHIP_BY_TYPE: Record<EventType, string> = {
  consultation: 'bg-sky-500/10 text-sky-700 dark:text-sky-500',
  surgery: 'bg-red-500/10 text-red-600 dark:text-red-500',
  vaccine: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-500',
  exam: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  other: 'bg-stone-500/10 text-stone-700 dark:text-stone-300',
};

interface DaySummaryCard {
  key: string;
  label: string;
  icon: LucideIcon;
  chip: string;
  count: (events: ScheduleEvent[]) => number;
}

const CARDS: DaySummaryCard[] = [
  {
    key: 'total',
    label: 'Total no dia',
    icon: CalendarDays,
    chip: 'bg-teal-800/10 dark:bg-teal-500/10 text-teal-800 dark:text-teal-500',
    count: (events) => events.length,
  },
  ...(['consultation', 'surgery', 'vaccine', 'exam', 'other'] as EventType[]).map(
    (type): DaySummaryCard => ({
      key: type,
      label: EVENT_TYPE_MAP[type].label,
      icon: ICON_BY_TYPE[type],
      chip: CHIP_BY_TYPE[type],
      count: (events) => events.filter((event) => event.type === type).length,
    }),
  ),
];

interface DaySummaryCardsProps {
  events: ScheduleEvent[];
  loading?: boolean;
}

export function DaySummaryCards({ events, loading = false }: DaySummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {CARDS.map(({ key, label, icon: Icon, chip, count }) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4"
        >
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-md',
              chip,
            )}
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-7 w-10" />
            ) : (
              <p className="font-data text-2xl font-semibold leading-tight tracking-tight text-stone-900 dark:text-stone-100">
                {count(events)}
              </p>
            )}
            <p className="truncate text-xs text-stone-500 dark:text-stone-400">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
