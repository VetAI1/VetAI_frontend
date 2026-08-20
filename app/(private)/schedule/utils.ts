import { EVENT_TYPE_MAP } from '@/types/schedule';
import type {
  ScheduleDateRange,
  ScheduleEvent,
} from '@/types/schedule';

export function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromLocalDateStr(dateStr: string): Date {
  const [year = 0, month = 0, day = 0] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(dateStr: string, months: number): string {
  const date = fromLocalDateStr(dateStr);
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const day = Math.min(
    date.getDate(),
    getDaysInMonth(target.getFullYear(), target.getMonth()),
  );
  target.setDate(day);
  return toLocalDateStr(target);
}

export function getWeekStart(dateStr: string): Date {
  const date = fromLocalDateStr(dateStr);
  return addDays(date, -date.getDay());
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function getMonthRange(year: number, month: number): ScheduleDateRange {
  return {
    from: toLocalDateStr(new Date(year, month, 1)),
    to: toLocalDateStr(new Date(year, month, getDaysInMonth(year, month))),
  };
}

export function getWeekRange(weekStart: Date): ScheduleDateRange {
  return {
    from: toLocalDateStr(weekStart),
    to: toLocalDateStr(addDays(weekStart, 6)),
  };
}

export function groupEventsByDate(
  events: ScheduleEvent[],
): Record<string, ScheduleEvent[]> {
  const eventsByDate: Record<string, ScheduleEvent[]> = {};

  for (const event of events) {
    const dayEvents = eventsByDate[event.date] ?? [];
    dayEvents.push(event);
    eventsByDate[event.date] = dayEvents;
  }

  for (const dayEvents of Object.values(eventsByDate)) {
    dayEvents.sort((first, second) =>
      first.start_time.localeCompare(second.start_time),
    );
  }

  return eventsByDate;
}

export function parseTimeToMinutes(time?: string): number {
  const [hours = 0, minutes = 0] = (time ?? '00:00').split(':').map(Number);
  return hours * 60 + minutes;
}

export function isPastScheduleEvent(
  event: ScheduleEvent,
  now: Date = new Date(),
): boolean {
  const today = toLocalDateStr(now);
  if (event.date !== today) return event.date < today;

  const endTime = event.end_time
    ? parseTimeToMinutes(event.end_time)
    : parseTimeToMinutes(event.start_time) + 60;
  const currentTime = now.getHours() * 60 + now.getMinutes();
  return endTime <= currentTime;
}

export interface ScheduleEventPresentation {
  backgroundClass: string;
  textClass: string;
  dotClass: string;
}

export function getScheduleEventPresentation(
  event: ScheduleEvent,
  now?: Date,
): ScheduleEventPresentation {
  if (isPastScheduleEvent(event, now)) {
    return {
      backgroundClass:
        'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-800',
      textClass: 'text-stone-500/70 dark:text-stone-400/70',
      dotClass: 'bg-stone-300 dark:bg-stone-600',
    };
  }

  const typeStyle = EVENT_TYPE_MAP[event.type];
  return {
    backgroundClass: typeStyle.bg,
    textClass: typeStyle.color,
    dotClass: typeStyle.dot,
  };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
