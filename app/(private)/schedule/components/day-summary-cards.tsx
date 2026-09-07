'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/infra/utils';
import { EVENT_TYPE_MAP } from '@/types/schedule';
import type { EventType, ScheduleEvent } from '@/types/schedule';

interface DaySummaryCard {
  key: string;
  label: string;
  /** Classe de cor de fundo do marcador, compartilhada com a lista de eventos. */
  dot: string;
  count: (events: ScheduleEvent[]) => number;
}

const CARDS: DaySummaryCard[] = [
  {
    key: 'total',
    label: 'Total no dia',
    dot: 'bg-teal-800 dark:bg-teal-500',
    count: (events) => events.length,
  },
  ...(['consultation', 'surgery', 'vaccine', 'exam', 'other'] as EventType[]).map(
    (type): DaySummaryCard => ({
      key: type,
      label: EVENT_TYPE_MAP[type].label,
      dot: EVENT_TYPE_MAP[type].dot,
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
      {CARDS.map(({ key, label, dot, count }) => (
        <div
          key={key}
          className="min-w-0 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4"
        >
          {loading ? (
            <Skeleton className="h-7 w-10" />
          ) : (
            <p className="font-data text-2xl font-semibold leading-tight tracking-tight text-stone-900 dark:text-stone-100">
              {count(events)}
            </p>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            {/* Marcador com halo: o mesmo tom identifica o tipo aqui e na lista. */}
            <span className="relative grid size-3 shrink-0 place-items-center">
              <span
                className={cn('absolute inset-0 rounded-full opacity-20', dot)}
              />
              <span className={cn('size-1.5 rounded-full', dot)} />
            </span>
            <span className="truncate">{label}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
