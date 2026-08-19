import type {
  DischargeReason,
  DoseUnit,
  Execution,
  ExecutionStatus,
  HospitalizationEventType,
  HospitalizationRisk,
  HospitalizationStatus,
  PrescriptionFrequency,
  PrescriptionType,
} from '@/types/monitoring';

export const STATUS_MAP: Record<
  HospitalizationStatus,
  { label: string; badge: string; dot: string }
> = {
  TRIAGE: {
    label: 'Triagem',
    badge:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    dot: 'bg-yellow-500',
  },
  HOSPITALIZED: {
    label: 'Internado',
    badge: 'bg-sky-50 dark:bg-sky-900 text-sky-700 dark:text-sky-500',
    dot: 'bg-blue-500',
  },
  DISCHARGED: {
    label: 'Alta',
    badge: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-500',
    dot: 'bg-green-500',
  },
  DECEASED: {
    label: 'Óbito',
    badge: 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100',
    dot: 'bg-slate-500',
  },
  CANCELLED: {
    label: 'Cancelada',
    badge: 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400',
    dot: 'bg-slate-400',
  },
};

export const RISK_MAP: Record<
  HospitalizationRisk,
  { label: string; badge: string; dot: string }
> = {
  LOW: {
    label: 'Baixo risco',
    badge: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-500',
    dot: 'bg-green-500',
  },
  MEDIUM: {
    label: 'Risco moderado',
    badge:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    dot: 'bg-yellow-500',
  },
  HIGH: {
    label: 'Alto risco',
    badge: 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-500',
    dot: 'bg-red-500',
  },
};

export const PRESCRIPTION_TYPE_MAP: Record<
  PrescriptionType,
  { label: string; badge: string }
> = {
  MEDICATION: {
    label: 'Medicamento',
    badge: 'bg-sky-50 dark:bg-sky-900 text-sky-700 dark:text-sky-500',
  },
  PROCEDURE: {
    label: 'Procedimento',
    badge: 'bg-teal-800/10 dark:bg-teal-500/10 text-teal-800 dark:text-teal-500',
  },
  FLUID: {
    label: 'Fluidoterapia',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  },
};

export const DISCHARGE_REASON_LABELS: Record<DischargeReason, string> = {
  MEDICAL: 'Alta médica',
  REQUESTED: 'Alta solicitada',
  TRANSFER: 'Transferência',
  DISEASE: 'Doença',
  EUTHANASIA: 'Eutanásia',
};

export const DISCHARGE_REASON_OPTIONS = [
  { value: 'MEDICAL', label: DISCHARGE_REASON_LABELS.MEDICAL },
  { value: 'REQUESTED', label: DISCHARGE_REASON_LABELS.REQUESTED },
  { value: 'TRANSFER', label: DISCHARGE_REASON_LABELS.TRANSFER },
];

export const DEATH_REASON_OPTIONS = [
  { value: 'DISEASE', label: DISCHARGE_REASON_LABELS.DISEASE },
  { value: 'EUTHANASIA', label: DISCHARGE_REASON_LABELS.EUTHANASIA },
];

export const FREQUENCY_LABELS: Record<PrescriptionFrequency, string> = {
  RECURRING: 'Recorrente',
  ONCE: 'Apenas uma vez',
  AS_NEEDED: 'Quando necessário (SOS)',
};

export const DOSE_UNIT_LABELS: Record<DoseUnit, string> = {
  MG: 'mg',
  MCG: 'mcg',
  G: 'g',
  ML: 'ml',
  ML_H: 'ml/h',
  TABLET: 'comprimido(s)',
  CAPSULE: 'cápsula(s)',
  DROP: 'gota(s)',
};

export type ExecutionVisualStatus = ExecutionStatus | 'LATE';

export const EXECUTION_STATUS_MAP: Record<
  ExecutionVisualStatus,
  { label: string; badge: string; chip: string }
> = {
  PENDING: {
    label: 'Programada',
    badge: 'bg-sky-50 dark:bg-sky-900 text-sky-700 dark:text-sky-500',
    chip: 'bg-sky-700 dark:bg-sky-500 text-white hover:bg-sky-700/90 dark:hover:bg-sky-500/90',
  },
  LATE: {
    label: 'Atrasada',
    badge: 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-500',
    chip: 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-600/90 dark:hover:bg-red-500/90',
  },
  DONE: {
    label: 'Concluída',
    badge: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-500',
    chip: 'bg-emerald-700 dark:bg-emerald-500 text-white hover:bg-emerald-700/90 dark:hover:bg-emerald-500/90',
  },
  CANCELLED: {
    label: 'Cancelada',
    badge: 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400',
    chip: 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300',
  },
};

export function executionVisualStatus(
  execution: Execution,
  now: Date = new Date(),
): ExecutionVisualStatus {
  if (execution.status === 'PENDING') {
    return new Date(execution.scheduled_at) < now ? 'LATE' : 'PENDING';
  }
  return execution.status;
}

export const EVENT_TYPE_LABELS: Record<HospitalizationEventType, string> = {
  OCCURRENCE: 'Ocorrência',
  WEIGHT: 'Peso',
  CLINICAL_PARAMETERS: 'Parâmetros clínicos',
  STATUS_CHANGE: 'Situação',
  BOX_CHANGE: 'Box',
};

export function doseLabel(prescription: {
  dose_value?: number;
  dose_unit?: DoseUnit;
}): string {
  if (!prescription.dose_value || !prescription.dose_unit) return '';
  const value = Number.isInteger(prescription.dose_value)
    ? prescription.dose_value
    : prescription.dose_value.toLocaleString('pt-BR');
  return `${value} ${DOSE_UNIT_LABELS[prescription.dose_unit]}`;
}

export function fmtDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function fmtDateTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtTime(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysSince(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function dayRangeISO(dateStr: string): { from: string; to: string } {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function todayLocalISODate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function toISO(date: string, time: string): string {
  return new Date(`${date}T${time || '00:00'}`).toISOString();
}

export function nowDateTimeLocal(): { date: string; time: string } {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  const local = new Date(now.getTime() - offset).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
}
