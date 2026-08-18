export type EventType =
  'consultation' | 'surgery' | 'vaccine' | 'exam' | 'other';

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  type: EventType;
  patientName?: string;
  tutorName?: string;
}

export const EVENT_TYPE_MAP: Record<
  EventType,
  { label: string; color: string; bg: string; dot: string }
> = {
  consultation: {
    label: 'Consulta',
    color: 'text-info',
    bg: 'bg-info-soft border-info/30',
    dot: 'bg-info',
  },
  surgery: {
    label: 'Cirurgia',
    color: 'text-danger',
    bg: 'bg-danger-soft border-danger/30',
    dot: 'bg-danger',
  },
  vaccine: {
    label: 'Vacina',
    color: 'text-success',
    bg: 'bg-success-soft border-success/30',
    dot: 'bg-success',
  },
  exam: {
    label: 'Exame',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  other: {
    label: 'Outro',
    color: 'text-secondary-foreground',
    bg: 'bg-secondary border-border',
    dot: 'bg-muted-foreground/60',
  },
};
