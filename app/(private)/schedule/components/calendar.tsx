import { Plus } from 'lucide-react';

import {
  DAY_NAMES,
  getDaysInMonth,
  getFirstDayOfMonth,
  getScheduleEventPresentation,
  groupEventsByDate,
} from '../utils';

import type { ScheduleEvent } from '@/types/schedule';

interface CalendarProps {
  year: number;
  month: number;
  events: ScheduleEvent[];
  selectedDate: string | null;
  today: string;
  onSelectDate: (date: string) => void;
  onAddClick: (date: string) => void;
  onEventClick: (event: ScheduleEvent) => void;
}

export function Calendar({
  year,
  month,
  events,
  selectedDate,
  today,
  onSelectDate,
  onAddClick,
  onEventClick,
}: CalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const eventsByDate = groupEventsByDate(events);

  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-stone-500 dark:text-stone-400 py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-[72px]" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = eventsByDate[dateStr] ?? [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          return (
            <div
              key={dateStr}
              className={`group relative h-[72px] flex flex-col items-start p-1.5 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'bg-teal-800/10 dark:bg-teal-500/10 border-teal-800/40 dark:border-teal-500/40'
                  : 'border-transparent hover:bg-stone-100/60 dark:hover:bg-stone-800/60'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectDate(dateStr)}
                className="absolute inset-0 rounded-lg"
                aria-label={`Selecionar dia ${day}`}
              />
              <span
                className={`relative z-10 pointer-events-none text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-0.5 ${
                  isToday
                    ? 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950'
                    : 'text-stone-800 dark:text-stone-100'
                }`}
              >
                {day}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddClick(dateStr);
                }}
                className="absolute right-1.5 top-1.5 z-20 grid size-5 scale-90 place-items-center rounded-md bg-teal-800 text-white opacity-0 transition-[opacity,transform] duration-150 group-hover:scale-100 group-hover:opacity-100 hover:bg-teal-800/90 focus-visible:scale-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-800/40 motion-reduce:transition-none dark:bg-teal-500 dark:text-stone-950 dark:hover:bg-teal-500/90"
                aria-label={`Adicionar evento em ${dateStr}`}
              >
                <Plus size={13} />
              </button>

              <div className="relative z-10 flex flex-col gap-0.5 w-full overflow-hidden">
                {dayEvents.slice(0, 2).map((ev) => {
                  const presentation = getScheduleEventPresentation(ev);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onEventClick(ev)}
                      className={`w-full truncate text-[10px] font-medium px-1 py-0.5 rounded flex items-center gap-1 border ${presentation.backgroundClass} ${presentation.textClass} hover:opacity-80 transition-opacity`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full shrink-0 ${presentation.dotClass}`}
                      />
                      <span className="truncate">{ev.title}</span>
                    </button>
                  );
                })}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 px-1">
                    +{dayEvents.length - 2} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
