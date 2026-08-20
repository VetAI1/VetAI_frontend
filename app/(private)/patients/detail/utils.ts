export { calcAge, fmtDate, fmtDateTime, parseBirthDate } from '@/utils/date-format';

export const STUDY_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou',
};

export const STUDY_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-400',
  PROCESSING: 'bg-sky-50 dark:bg-sky-900 text-sky-700 dark:text-sky-500',
  COMPLETED: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-500',
  FAILED: 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-500',
};
