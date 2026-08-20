import { PawPrint, Plus, User } from 'lucide-react';

import { EmptyState } from '@/app/components/common/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { ScheduleEvent } from '@/types/schedule';
import { EVENT_TYPE_MAP } from '@/types/schedule';

interface TodayEventsListProps {
  date: string;
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  onAddClick: () => void;
  loading?: boolean;
}

export function TodayEventsList({
  date,
  events,
  onEventClick,
  onAddClick,
  loading = false,
}: TodayEventsListProps) {
  const sorted = [...events].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  const dateFormatted = new Date(`${date}T00:00:00`).toLocaleDateString(
    'pt-BR',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    },
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 capitalize">
            {dateFormatted}
          </h2>
          {loading ? (
            <Skeleton className="mt-0.5 h-3 w-16" />
          ) : (
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {sorted.length === 0
                ? 'Nenhum evento'
                : `${sorted.length} evento${sorted.length > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 text-xs font-medium text-teal-800 dark:text-teal-500 hover:text-teal-800 dark:hover:text-teal-500 transition-colors"
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="Sem eventos para este dia"
          className="flex-1 py-10"
          action={
            <button
              onClick={onAddClick}
              className="text-sm font-medium text-teal-800 dark:text-teal-500 hover:underline"
            >
              Agendar evento
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {sorted.map((ev) => {
            const typeInfo = EVENT_TYPE_MAP[ev.type];
            return (
              <button
                key={ev.id}
                onClick={() => onEventClick(ev)}
                className={`w-full text-left rounded-lg border p-3 transition-all hover:shadow-sm ${typeInfo.bg}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${typeInfo.dot}`}
                    />
                    <span
                      className={`text-sm font-semibold truncate ${typeInfo.color}`}
                    >
                      {ev.title}
                    </span>
                  </span>
                  <span
                    className={`text-xs shrink-0 font-medium ${typeInfo.color}`}
                  >
                    {ev.start_time}
                    {ev.end_time ? ` – ${ev.end_time}` : ''}
                  </span>
                </span>
                {(ev.patient_name ?? ev.tutor_name) && (
                  <span className="flex flex-col gap-0.5 mt-1.5 pl-4">
                    {ev.patient_name && (
                      <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                        <PawPrint size={11} /> {ev.patient_name}
                      </span>
                    )}
                    {ev.tutor_name && (
                      <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                        <User size={11} /> {ev.tutor_name}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
