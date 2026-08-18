export { calcAge, fmtDate, fmtDateTime, parseBirthDate } from '@/utils/date-format';

export const STUDY_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou',
};

export const STUDY_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-warning-soft text-warning',
  PROCESSING: 'bg-info-soft text-info',
  COMPLETED: 'bg-success-soft text-success',
  FAILED: 'bg-danger-soft text-danger',
};
