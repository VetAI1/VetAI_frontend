import { DAY_NAMES, getDaysInMonth, getFirstDayOfMonth } from '../utils';

import { EVENT_TYPE_MAP } from '@/types/schedule';
import type { ScheduleEvent } from '@/types/schedule';

interface CalendarProps {
  year: number;
  month: number;
  events: ScheduleEvent[];
  selectedDate: string | null;
  today: string;
  onSelectDate: (date: string) => void;
  onEventClick: (event: ScheduleEvent) => void;
}

export function Calendar({
  year,
  month,
  events,
  selectedDate,
  today,
  onSelectDate,
  onEventClick,
}: CalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const eventsByDate: Record<string, ScheduleEvent[]> = {};
  for (const e of events) {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date]!.push(e);
  }

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
            className="text-center text-xs font-semibold text-muted-foreground py-2"
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
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative h-[72px] flex flex-col items-start p-1.5 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'bg-primary/10 border-primary/40'
                  : 'border-transparent hover:bg-secondary/60'
              }`}
            >
              <span
                className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-0.5 ${
                  isToday
                    ? 'bg-primary text-primary-foreground'
                    : 'text-secondary-foreground'
                }`}
              >
                {day}
              </span>

              <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                {dayEvents.slice(0, 2).map((ev) => {
                  const past = ev.date < today;
                  const bgColor = past
                    ? 'bg-secondary border-border'
                    : `${EVENT_TYPE_MAP[ev.type].bg}`;
                  const textColor = past
                    ? 'text-muted-foreground/70'
                    : EVENT_TYPE_MAP[ev.type].color;
                  const dotColor = past
                    ? 'bg-slate-300 dark:bg-slate-600'
                    : EVENT_TYPE_MAP[ev.type].dot;
                  return (
                    <button
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(ev);
                      }}
                      className={`w-full truncate text-[10px] font-medium px-1 py-0.5 rounded flex items-center gap-1 border ${bgColor} ${textColor} hover:opacity-80 transition-opacity`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full shrink-0 ${dotColor}`}
                      />
                      <span className="truncate">{ev.title}</span>
                    </button>
                  );
                })}
                {dayEvents.length > 2 && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    +{dayEvents.length - 2} mais
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
