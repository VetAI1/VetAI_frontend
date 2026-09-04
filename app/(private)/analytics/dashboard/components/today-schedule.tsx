'use client';

import { EmptyState } from '@/app/components/common/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/infra/utils';
import type { ScheduleEvent } from '@/types/schedule';
import { EVENT_TYPE_MAP } from '@/types/schedule';

interface TodayScheduleProps {
  events: ScheduleEvent[];
  loading?: boolean;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function TodaySchedule({ events, loading = false }: TodayScheduleProps) {
  const sorted = [...events].sort(
    (a, b) => toMinutes(a.start_time) - toMinutes(b.start_time),
  );

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nextEvent = sorted.find(
    (event) => toMinutes(event.start_time) >= nowMinutes,
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="Nenhum agendamento para hoje"
        description="Os compromissos criados na agenda aparecem aqui."
        className="h-full"
      />
    );
  }

  return (
    <ol className="flex flex-col">
      {sorted.map((event, index) => {
        const typeInfo = EVENT_TYPE_MAP[event.type];
        const isNext = nextEvent?.id === event.id;
        const isPast = toMinutes(event.start_time) < nowMinutes;

        return (
          <li
            key={event.id}
            className={cn(
              'flex gap-4 py-3',
              index > 0 && 'border-t border-stone-200 dark:border-stone-800',
            )}
          >
            <div className="w-14 shrink-0 pt-0.5 text-right">
              <p
                className={cn(
                  'font-data text-sm font-semibold',
                  isPast
                    ? 'text-stone-500 dark:text-stone-400'
                    : 'text-stone-900 dark:text-stone-100',
                )}
              >
                {event.start_time}
              </p>
              {event.end_time && (
                <p className="font-data text-[11px] text-stone-500 dark:text-stone-400">
                  {event.end_time}
                </p>
              )}
            </div>

            <span
              className={cn(
                'mt-1.5 size-2 shrink-0 rounded-full',
                typeInfo.dot,
                isPast && 'opacity-40',
              )}
              aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    'truncate text-sm font-semibold',
                    isPast
                      ? 'text-stone-500 dark:text-stone-400'
                      : 'text-stone-900 dark:text-stone-100',
                  )}
                >
                  {event.title}
                </p>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                  {typeInfo.label}
                </span>
                {isNext && (
                  <span className="rounded-full bg-teal-700/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:bg-teal-500/10 dark:text-teal-500">
                    Próximo
                  </span>
                )}
              </div>
              {(event.patient_name || event.tutor_name) && (
                <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                  {[event.patient_name, event.tutor_name]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
