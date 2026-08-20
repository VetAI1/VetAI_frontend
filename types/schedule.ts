export type EventType =
  'consultation' | 'surgery' | 'vaccine' | 'exam' | 'other';

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time?: string; // HH:mm
  type: EventType;
  patient_name?: string;
  tutor_name?: string;
}

export interface ScheduleDateRange {
  from: string;
  to: string;
}

export const EVENT_TYPE_MAP: Record<
  EventType,
  { label: string; color: string; bg: string; dot: string }
> = {
  consultation: {
    label: 'Consulta',
    color: 'text-sky-700 dark:text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-900 border-sky-700/30 dark:border-sky-500/30',
    dot: 'bg-sky-700 dark:bg-sky-500',
  },
  surgery: {
    label: 'Cirurgia',
    color: 'text-red-600 dark:text-red-500',
    bg: 'bg-red-50 dark:bg-red-900 border-red-600/30 dark:border-red-500/30',
    dot: 'bg-red-600 dark:bg-red-500',
  },
  vaccine: {
    label: 'Vacina',
    color: 'text-emerald-700 dark:text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900 border-emerald-700/30 dark:border-emerald-500/30',
    dot: 'bg-emerald-700 dark:bg-emerald-500',
  },
  exam: {
    label: 'Exame',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  other: {
    label: 'Outro',
    color: 'text-stone-800 dark:text-stone-100',
    bg: 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-800',
    dot: 'bg-stone-500/60 dark:bg-stone-400/60',
  },
};
