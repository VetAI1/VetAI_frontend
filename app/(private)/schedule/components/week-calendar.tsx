'use client';

import { Plus } from 'lucide-react';
import { useState, type MouseEvent } from 'react';

import {
  DAY_NAMES,
  getScheduleEventPresentation,
  getWeekDays,
  groupEventsByDate,
  parseTimeToMinutes,
  toLocalDateStr,
} from '../utils';

import type { ScheduleEvent } from '@/types/schedule';

const HOUR_PX = 64;
export const DEFAULT_START_HOUR = 7;
export const DEFAULT_END_HOUR = 21;

interface HoveredSlot {
  date: string;
  time: string;
  top: number;
}

interface PositionedEvent {
  event: ScheduleEvent;
  top: number;
  height: number;
  left: number;
  width: number;
}

interface TimedEvent {
  event: ScheduleEvent;
  start: number;
  end: number;
  top: number;
  height: number;
}

interface WeekCalendarProps {
  weekStart: Date;
  events: ScheduleEvent[];
  selectedDate: string;
  today: string;
  startHour?: number;
  endHour?: number;
  onSelectDate: (date: string) => void;
  onEventClick: (event: ScheduleEvent) => void;
  onSlotClick?: ((date: string, time: string) => void) | undefined;
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

function getPositionedEvents(
  events: ScheduleEvent[],
  startHour: number,
  endHour: number,
): PositionedEvent[] {
  const visibleStart = startHour * 60;
  const visibleEnd = endHour * 60;
  const pixelsPerMinute = HOUR_PX / 60;

  const timedEvents: TimedEvent[] = events
    .map((event) => {
      const start = parseTimeToMinutes(event.start_time);
      const end = event.end_time
        ? parseTimeToMinutes(event.end_time)
        : start + 60;
      const clippedStart = Math.max(start, visibleStart);
      const clippedEnd = Math.min(end, visibleEnd);

      if (clippedEnd <= clippedStart) return null;

      return {
        event,
        start: clippedStart,
        end: clippedEnd,
        top: (clippedStart - visibleStart) * pixelsPerMinute,
        height: Math.min(
          Math.max((clippedEnd - clippedStart) * pixelsPerMinute, 22),
          (visibleEnd - clippedStart) * pixelsPerMinute,
        ),
      };
    })
    .filter((event): event is TimedEvent => event !== null)
    .sort((first, second) => first.start - second.start || first.end - second.end);

  const groups: TimedEvent[][] = [];
  for (const event of timedEvents) {
    const group = groups.at(-1);
    const groupEnd = group ? Math.max(...group.map((item) => item.end)) : 0;

    if (!group || event.start >= groupEnd) groups.push([event]);
    else group.push(event);
  }

  return groups.flatMap((group) => {
    const columnEnds: number[] = [];
    const positioned = group.map((event) => {
      const column = columnEnds.findIndex((end) => end <= event.start);
      const assignedColumn = column === -1 ? columnEnds.length : column;
      columnEnds[assignedColumn] = event.end;
      return { ...event, column: assignedColumn };
    });
    const width = 100 / columnEnds.length;

    return positioned.map(({ event, top, height, column }) => ({
      event,
      top,
      height,
      left: column * width,
      width,
    }));
  });
}

interface WeekHeaderProps {
  days: Date[];
  eventsByDate: Record<string, ScheduleEvent[]>;
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
}

function WeekHeader({
  days,
  eventsByDate,
  selectedDate,
  today,
  onSelectDate,
}: WeekHeaderProps) {
  return (
    <div
      className="grid border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900"
      style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}
    >
      <div />
      {days.map((date, index) => {
        const dateStr = toLocalDateStr(date);
        const isToday = dateStr === today;
        const isSelected = dateStr === selectedDate;
        const weekend = isWeekend(date);
        const hasEvents = (eventsByDate[dateStr] ?? []).length > 0;

        return (
          <button
            key={dateStr}
            type="button"
            onClick={() => onSelectDate(dateStr)}
            aria-pressed={isSelected}
            className={`px-1 py-2 text-center transition-colors ${
              isSelected
                ? 'bg-teal-800/10 dark:bg-teal-500/10'
                : weekend
                  ? 'bg-stone-100/60 dark:bg-stone-800/60'
                  : 'hover:bg-stone-100/60 dark:hover:bg-stone-800/60'
            }`}
          >
            <p
              className={`text-[11px] font-medium uppercase tracking-wide ${
                weekend
                  ? 'text-stone-500/80 dark:text-stone-400/60'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {DAY_NAMES[index]}
            </p>
            <span className="relative mx-auto mt-0.5 block w-fit">
              <span
                className={`flex size-7 items-center justify-center rounded-full text-sm font-bold ${
                  isToday
                    ? 'bg-teal-800 text-white dark:bg-teal-500 dark:text-stone-950'
                    : 'text-stone-800 dark:text-stone-100'
                }`}
              >
                {date.getDate()}
              </span>
              {hasEvents && !isToday && (
                <span className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-teal-800 dark:bg-teal-500" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface WeekDayColumnProps {
  date: Date;
  events: ScheduleEvent[];
  selected: boolean;
  today: string;
  totalHeight: number;
  startHour: number;
  endHour: number;
  hoveredSlot: HoveredSlot | null;
  onSelectDate: (date: string) => void;
  onSlotClick?: ((date: string, time: string) => void) | undefined;
  onHover: (slot: HoveredSlot | null) => void;
  onEventClick: (event: ScheduleEvent) => void;
}

function WeekDayColumn({
  date,
  events,
  selected,
  today,
  totalHeight,
  startHour,
  endHour,
  hoveredSlot,
  onSelectDate,
  onSlotClick,
  onHover,
  onEventClick,
}: WeekDayColumnProps) {
  const dateStr = toLocalDateStr(date);
  const positionedEvents = getPositionedEvents(events, startHour, endHour);
  const weekend = isWeekend(date);
  const isToday = dateStr === today;

  function getSlot(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetMinutes = ((event.clientY - rect.top) * 60) / HOUR_PX;
    const maximumMinutes = (endHour - startHour) * 60;
    const minutes = Math.min(
      Math.max(Math.round(offsetMinutes / 30) * 30, 0),
      maximumMinutes,
    );
    return {
      time: formatTime(minutes + startHour * 60),
      top: (minutes / 60) * HOUR_PX,
    };
  }

  return (
    <div
      onClick={(event) => {
        const slot = getSlot(event);
        onSelectDate(dateStr);
        onSlotClick?.(dateStr, slot.time);
      }}
      onMouseMove={(event) => {
        if (event.target === event.currentTarget) {
          onHover({ date: dateStr, ...getSlot(event) });
        } else onHover(null);
      }}
      onMouseLeave={() => onHover(null)}
      className={`relative cursor-crosshair border-l border-stone-200 dark:border-stone-800 ${
        selected
          ? 'bg-teal-800/10 dark:bg-teal-500/10'
          : isToday
            ? 'bg-teal-800/5 dark:bg-teal-500/5'
            : weekend
              ? 'bg-stone-100/40 dark:bg-stone-800/40'
              : ''
      }`}
      style={{ height: totalHeight }}
    >
      <div
        className={`pointer-events-none absolute inset-x-1 z-[11] flex -translate-y-1/2 items-center gap-1 rounded bg-teal-800 px-1.5 py-0.5 text-[10px] font-semibold text-white transition-[opacity,transform] duration-150 motion-reduce:transition-none dark:bg-teal-500 dark:text-stone-950 ${
          hoveredSlot?.date === dateStr
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0'
        }`}
        style={{ top: hoveredSlot?.date === dateStr ? hoveredSlot.top : 0 }}
      >
        <Plus size={11} /> {hoveredSlot?.date === dateStr ? hoveredSlot.time : ''}
      </div>
      {positionedEvents.map(({ event, top, height, left, width }) => {
        const presentation = getScheduleEventPresentation(event);
        return (
          <button
            key={event.id}
            type="button"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation();
              onEventClick(event);
            }}
            title={`${event.title}${event.patient_name ? ` · ${event.patient_name}` : ''}`}
            className={`absolute z-10 overflow-hidden rounded border px-1.5 py-0.5 text-left transition-opacity hover:opacity-80 ${presentation.backgroundClass} ${presentation.textClass}`}
            style={{ top, height, left: `${left}%`, width: `${width}%` }}
          >
            <span className="block truncate text-[10px] font-semibold leading-snug">
              {event.title}
            </span>
            {height >= 32 && (
              <span className="block truncate text-[9px] leading-snug opacity-75">
                {event.start_time}
                {event.end_time ? ` – ${event.end_time}` : ''}
                {event.patient_name ? ` · ${event.patient_name}` : ''}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function WeekCalendar({
  weekStart,
  events,
  selectedDate,
  today,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
  onSelectDate,
  onEventClick,
  onSlotClick,
}: WeekCalendarProps) {
  const days = getWeekDays(weekStart);
  const eventsByDate = groupEventsByDate(events);
  const totalHours = Math.max(endHour - startHour, 1);
  const hours = Array.from({ length: totalHours + 1 }, (_, index) => startHour + index);
  const totalHeight = totalHours * HOUR_PX;
  const [hoveredSlot, setHoveredSlot] = useState<HoveredSlot | null>(null);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isTodayInWeek = days.some((date) => toLocalDateStr(date) === today);
  const showNowLine =
    isTodayInWeek &&
    nowMinutes >= startHour * 60 &&
    nowMinutes <= endHour * 60;
  const nowTop = (nowMinutes - startHour * 60) * (HOUR_PX / 60);

  return (
    <div className="w-full overflow-x-auto">
      <WeekHeader
        days={days}
        eventsByDate={eventsByDate}
        selectedDate={selectedDate}
        today={today}
        onSelectDate={onSelectDate}
      />

      <div className="overflow-y-auto" style={{ maxHeight: '580px' }}>
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: '48px repeat(7, 1fr)',
            height: totalHeight,
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{ height: totalHeight }}
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute inset-x-0 border-t border-stone-200/70 dark:border-stone-800/70"
                style={{ top: (hour - startHour) * HOUR_PX }}
              />
            ))}
          </div>

          <div className="relative z-10" style={{ height: totalHeight }}>
            {hours.slice(0, -1).map((hour) => (
              <span
                key={hour}
                className="absolute right-2 select-none text-[10px] leading-none text-stone-500/70 dark:text-stone-400/70"
                style={{ top: (hour - startHour) * HOUR_PX + 3 }}
              >
                {String(hour).padStart(2, '0')}:00
              </span>
            ))}
          </div>

          {showNowLine && (
            <div
              className="pointer-events-none absolute inset-x-0 z-20"
              style={{ top: nowTop }}
            >
              <div className="flex items-center">
                <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-px text-[9px] font-bold leading-tight text-white">
                  agora
                </span>
                <div className="flex-1 border-t-2 border-red-500" />
              </div>
            </div>
          )}

          {days.map((date) => {
            const dateStr = toLocalDateStr(date);
            return (
              <WeekDayColumn
                key={dateStr}
                date={date}
                events={eventsByDate[dateStr] ?? []}
                selected={dateStr === selectedDate}
                today={today}
                totalHeight={totalHeight}
                startHour={startHour}
                endHour={endHour}
                hoveredSlot={hoveredSlot}
                onSelectDate={onSelectDate}
                onSlotClick={onSlotClick}
                onHover={setHoveredSlot}
                onEventClick={onEventClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
