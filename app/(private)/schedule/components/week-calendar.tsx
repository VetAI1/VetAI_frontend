'use client';

import { DAY_NAMES } from '../utils';

import { EVENT_TYPE_MAP } from '@/types/schedule';
import type { ScheduleEvent } from '@/types/schedule';

const HOUR_PX = 64;
export const DEFAULT_START_HOUR = 7;
export const DEFAULT_END_HOUR = 21;

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseMinutes(time: string): number {
  const [h = 0, m = 0] = time.split(':').map(Number);
  return h * 60 + m;
}

function isPastEvent(ev: ScheduleEvent, today: string): boolean {
  if (ev.date < today) return true;
  if (ev.date === today) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const endMin = ev.endTime ? parseMinutes(ev.endTime) : parseMinutes(ev.startTime) + 60;
    return endMin <= nowMin;
  }
  return false;
}

interface WeekCalendarProps {
  weekStart: Date;
  events: ScheduleEvent[];
  today: string;
  startHour?: number;
  endHour?: number;
  onEventClick: (event: ScheduleEvent) => void;
}

export function WeekCalendar({
  weekStart,
  events,
  today,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
  onEventClick,
}: WeekCalendarProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const eventsByDate: Record<string, ScheduleEvent[]> = {};
  for (const e of events) {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date]!.push(e);
  }

  const totalHours = endHour - startHour;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);
  const totalHeight = totalHours * HOUR_PX;

  function getEventStyle(ev: ScheduleEvent): { top: number; height: number } {
    const startMin = parseMinutes(ev.startTime);
    const endMin = ev.endTime ? parseMinutes(ev.endTime) : startMin + 60;
    const startFromGrid = Math.max(startMin - startHour * 60, 0);
    const duration = Math.max(endMin - startMin, 15);
    const top = startFromGrid * (HOUR_PX / 60);
    const height = Math.max(duration * (HOUR_PX / 60), 22);
    return { top, height: Math.min(height, totalHeight - top) };
  }

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="grid border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
        style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}
      >
        <div />
        {days.map((d, i) => {
          const dateStr = toDateStr(d);
          const isToday = dateStr === today;
          const hasEvents = (eventsByDate[dateStr] ?? []).length > 0;
          return (
            <div key={i} className="text-center py-2 px-1">
              <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                {DAY_NAMES[i]}
              </p>
              <div className="relative mx-auto w-fit mt-0.5">
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    isToday
                      ? 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950'
                      : 'text-stone-800 dark:text-stone-100'
                  }`}
                >
                  {d.getDate()}
                </div>
                {hasEvents && !isToday && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-800 dark:bg-teal-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '580px' }}>
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: '48px repeat(7, 1fr)',
            height: totalHeight,
          }}
        >
          <div
            className="absolute left-0 right-0 top-0 pointer-events-none"
            style={{ height: totalHeight }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-stone-200/70 dark:border-stone-800/70"
                style={{ top: (h - startHour) * HOUR_PX }}
              />
            ))}
          </div>

          <div className="relative z-10" style={{ height: totalHeight }}>
            {hours.slice(0, -1).map((h) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] text-stone-500/70 dark:text-stone-400/70 leading-none select-none"
                style={{ top: (h - startHour) * HOUR_PX + 3 }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {days.map((d, i) => {
            const dateStr = toDateStr(d);
            const dayEvents = eventsByDate[dateStr] ?? [];

            return (
              <div
                key={i}
                className="relative border-l border-stone-200 dark:border-stone-800"
                style={{ height: totalHeight }}
              >
                {dayEvents.map((ev) => {
                  const { top, height } = getEventStyle(ev);
                  if (top >= totalHeight) return null;
                  const typeStyle = EVENT_TYPE_MAP[ev.type];
                  const past = isPastEvent(ev, today);
                  const bgClass = past
                    ? 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-800'
                    : typeStyle.bg;
                  const colorClass = past
                    ? 'text-stone-500/70 dark:text-stone-400/70'
                    : typeStyle.color;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => onEventClick(ev)}
                      title={`${ev.title}${ev.patientName ? ` · ${ev.patientName}` : ''}`}
                      className={`absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-left overflow-hidden border z-10 hover:opacity-80 transition-opacity ${bgClass} ${colorClass}`}
                      style={{ top, height }}
                    >
                      <span className="block text-[10px] font-semibold leading-snug truncate">
                        {ev.title}
                      </span>
                      {height >= 32 && (
                        <span className="block text-[9px] opacity-75 leading-snug truncate">
                          {ev.startTime}
                          {ev.endTime ? ` – ${ev.endTime}` : ''}
                          {ev.patientName ? ` · ${ev.patientName}` : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
