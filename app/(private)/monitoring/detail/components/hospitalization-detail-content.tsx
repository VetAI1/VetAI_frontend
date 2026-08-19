'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import {
  Activity,
  ArrowLeft,
  ArrowRightLeft,
  Beaker,
  BedDouble,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileDown,
  History,
  Loader2,
  MapPin,
  MessageSquarePlus,
  MoveRight,
  OctagonPause,
  PawPrint,
  Pencil,
  Phone,
  Pill,
  Plus,
  RotateCcw,
  Scale,
  Skull,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { ApplyTemplateModal } from '../../components/apply-template-modal';
import { ExecuteModal } from '../../components/execute-modal';
import { HospitalizeModal } from '../../components/hospitalize-modal';
import { PrescriptionModal } from '../../components/prescription-modal';
import {
  OccurrenceModal,
  WeightModal,
} from '../../components/quick-add-modals';
import { VitalHistoryTable } from '../../components/vital-history-table';
import { VitalSignsModal } from '../../components/vital-signs-modal';
import { VitalSummaryCards } from '../../components/vital-summary-cards';
import { VitalsChart } from '../../components/vitals-chart';
import {
  daysSince,
  DEATH_REASON_OPTIONS,
  DISCHARGE_REASON_LABELS,
  DISCHARGE_REASON_OPTIONS,
  doseLabel,
  EVENT_TYPE_LABELS,
  fmtDate,
  fmtDateTime,
  fmtTime,
  FREQUENCY_LABELS,
  nowDateTimeLocal,
  PRESCRIPTION_TYPE_MAP,
  RISK_MAP,
  STATUS_MAP,
  toISO,
} from '../../utils';

import { ConfirmModal } from '@/app/components/common/confirm-modal';
import { Modal } from '@/app/components/common/modal';
import { WhatsAppIcon } from '@/app/components/common/whatsapp-icon';
import { SectionCard } from '@/app/components/data/section-card';
import { DateInput } from '@/app/components/forms/date-input';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { TimeInput } from '@/app/components/forms/time-input';
import { Button } from '@/components/ui/button';
import {
  evaluateCadence,
  formatVitalDuration,
  SPECIE_LABELS,
  VITAL_DEFINITIONS,
} from '@/constants';
import { dischargeSchema, type DischargeFormData } from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type {
  Box,
  DischargeReason,
  Execution,
  Hospitalization,
  HospitalizationEvent,
  HospPrescription,
  VitalRecord,
} from '@/types/monitoring';
import type { Specie } from '@/types/patient';
import { calcAge } from '@/utils/date-format';
import { capitalize } from '@/utils/format';
import { formatPhone } from '@/utils/masks';
import { whatsappLink } from '@/utils/phone';

type CloseAction = 'discharge' | 'decease' | 'cancel';

const SEX_LABELS: Record<string, string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
};

function buildWhatsAppLink(
  phone: string,
  tutorName: string,
  patientName: string,
  patientSex?: string,
): string {
  const article =
    patientSex === 'FEMALE' ? 'a ' : patientSex === 'MALE' ? 'o ' : '';
  const message = `Oi ${tutorName.trim()}, Tudo bem? Tenho novidades sobre ${article}${patientName}.`;
  return whatsappLink(phone, message) ?? '';
}

const CLOSE_ACTION_INFO: Record<
  CloseAction,
  { title: string; confirm: string; notesLabel: string }
> = {
  discharge: {
    title: 'Registrar Alta',
    confirm: 'Confirmar alta',
    notesLabel: 'Orientações da alta',
  },
  decease: {
    title: 'Registrar Óbito',
    confirm: 'Registrar óbito',
    notesLabel: 'Observações',
  },
  cancel: {
    title: 'Cancelar Internação',
    confirm: 'Cancelar internação',
    notesLabel: 'Motivo do cancelamento',
  },
};

function CloseActionModal({
  action,
  hospitalizationId,
  onClose,
  onSuccess,
}: {
  action: CloseAction;
  hospitalizationId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const info = CLOSE_ACTION_INFO[action];
  const now = nowDateTimeLocal();

  const needsDate = action === 'decease';
  const needsReason = action !== 'cancel';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DischargeFormData>({
    resolver: yupResolver(dischargeSchema) as Resolver<DischargeFormData>,
    defaultValues: {
      needs_date: needsDate,
      needs_reason: needsReason,
      date: now.date,
      time: now.time,
      reason: '',
      notes: '',
    },
  });

  const onSubmit = async (data: DischargeFormData) => {
    setSaving(true);
    try {
      const reason = data.reason as DischargeReason;
      if (action === 'discharge') {
        await monitoringService.discharge(hospitalizationId, {
          date: new Date().toISOString(),
          reason,
          ...(data.notes ? { notes: data.notes } : {}),
        });
      } else if (action === 'decease') {
        await monitoringService.decease(hospitalizationId, {
          date: toISO(data.date ?? now.date, data.time ?? now.time),
          reason,
          ...(data.notes ? { notes: data.notes } : {}),
        });
      } else {
        await monitoringService.cancel(hospitalizationId, {
          ...(data.notes ? { notes: data.notes } : {}),
        });
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={info.title} onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {action === 'discharge' && (
          <div className="flex items-start gap-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 px-3 py-2.5 text-xs text-stone-500 dark:text-stone-400">
            <Clock size={14} className="mt-px shrink-0" />
            <span>
              A data e o horário da alta são registrados automaticamente no
              momento da confirmação.
            </span>
          </div>
        )}

        {needsDate && (
          <div className="flex gap-3">
            <div className="flex-1">
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DateInput
                    label="Data do óbito"
                    required
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={errors.date?.message}
                  />
                )}
              />
            </div>
            <div className="w-32">
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <TimeInput
                    label="Hora"
                    required
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={errors.time?.message}
                  />
                )}
              />
            </div>
          </div>
        )}

        {needsReason && (
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <SelectInput
                label={action === 'discharge' ? 'Tipo de alta' : 'Causa do óbito'}
                required
                placeholder="Selecione"
                value={field.value ?? ''}
                onChange={field.onChange}
                options={
                  action === 'discharge'
                    ? DISCHARGE_REASON_OPTIONS
                    : DEATH_REASON_OPTIONS
                }
                error={errors.reason?.message}
              />
            )}
          />
        )}
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label={info.notesLabel}
              rows={3}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.notes?.message}
            />
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Voltar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className={
              action === 'discharge'
                ? 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90'
                : 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-600/90 dark:hover:bg-red-500/90'
            }
          >
            {info.confirm}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function MoveBoxModal({
  hospitalization,
  onClose,
  onSuccess,
}: {
  hospitalization: Hospitalization;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [boxId, setBoxId] = useState(hospitalization.box?.id ?? '');

  useEffect(() => {
    void monitoringService
      .listBoxes()
      .then(setBoxes)
      .catch(() => undefined);
  }, []);

  const options = [
    { value: '', label: 'Sem box' },
    ...boxes
      .filter(
        (box) =>
          box.active &&
          (!box.occupied || box.id === hospitalization.box?.id),
      )
      .map((box) => ({ value: box.id, label: box.name })),
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await monitoringService.moveBox(hospitalization.id, boxId || null);
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Mover de Box" onClose={onClose} maxWidth="sm">
      <div className="space-y-4">
        <SelectInput
          label="Novo box"
          value={boxId}
          onChange={setBoxId}
          options={options}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={() => void handleSave()}
            loading={saving}
            className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
          >
            Mover
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function RescheduleModal({
  prescription,
  onClose,
  onSuccess,
}: {
  prescription: HospPrescription;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const now = nowDateTimeLocal();
  const [date, setDate] = useState(now.date);
  const [time, setTime] = useState(now.time);
  const [intervalHours, setIntervalHours] = useState(
    prescription.interval_hours ? String(prescription.interval_hours) : '',
  );
  const [durationDays, setDurationDays] = useState(
    prescription.duration_days ? String(prescription.duration_days) : '',
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await monitoringService.reschedulePrescription(prescription.id, {
        start_at: toISO(date, time),
        ...(prescription.frequency === 'RECURRING'
          ? {
            interval_hours: Number(intervalHours),
            duration_days: Number(durationDays),
          }
          : {}),
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Interromper e Reprogramar"
      description={`As execuções pendentes de "${prescription.name}" serão canceladas e uma nova programação será criada.`}
      onClose={onClose}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <DateInput label="Novo início" required value={date} onChange={setDate} />
          </div>
          <div className="w-32">
            <TimeInput label="Hora" required value={time} onChange={setTime} />
          </div>
        </div>
        {prescription.frequency === 'RECURRING' && (
          <div className="grid grid-cols-2 gap-3">
            <InputWithLabel
              label="A cada (horas)"
              type="number"
              min="1"
              value={intervalHours}
              onChange={(e) => setIntervalHours(e.target.value)}
            />
            <InputWithLabel
              label="Durante (dias)"
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
            />
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={() => void handleSave()}
            loading={saving}
            className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
          >
            Reprogramar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function HospitalizationDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [hospitalization, setHospitalization] = useState<Hospitalization | null>(null);
  const [loading, setLoading] = useState(true);

  const [prescriptions, setPrescriptions] = useState<HospPrescription[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [events, setEvents] = useState<HospitalizationEvent[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showMoveBox, setShowMoveBox] = useState(false);
  const [closeAction, setCloseAction] = useState<CloseAction | null>(null);
  const [showReopen, setShowReopen] = useState(false);
  const [reopenLoading, setReopenLoading] = useState(false);

  const [showPrescription, setShowPrescription] = useState(false);
  const [showApplyTemplate, setShowApplyTemplate] = useState(false);
  const [stopping, setStopping] = useState<HospPrescription | null>(null);
  const [stopLoading, setStopLoading] = useState(false);
  const [rescheduling, setRescheduling] = useState<HospPrescription | null>(null);
  const [deletingPrescription, setDeletingPrescription] =
    useState<HospPrescription | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [executingSOS, setExecutingSOS] = useState<HospPrescription | null>(null);

  const [quickAdd, setQuickAdd] = useState<'occurrence' | 'weight' | 'parameters' | null>(null);
  const [detailTab, setDetailTab] = useState<'care' | 'history'>('care');

  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);

  const fetchHospitalization = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setHospitalization(await monitoringService.getHospitalization(id));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchPrescriptions = useCallback(async () => {
    if (!id) return;
    setPrescriptionsLoading(true);
    try {
      const [prescriptionsData, executionsData] = await Promise.all([
        monitoringService.listPrescriptions(id),
        monitoringService.listExecutionsByHospitalization(id),
      ]);
      setPrescriptions(prescriptionsData);
      setExecutions(executionsData);
    } finally {
      setPrescriptionsLoading(false);
    }
  }, [id]);

  const fetchTimeline = useCallback(async () => {
    if (!id) return;
    setTimelineLoading(true);
    try {
      const response = await monitoringService.listEvents(id, { size: 50 });
      setEvents(response.data);
    } finally {
      setTimelineLoading(false);
    }
  }, [id]);

  const fetchVitals = useCallback(async () => {
    if (!id) return;
    setVitalsLoading(true);
    try {
      setVitals(await monitoringService.listVitals(id));
    } finally {
      setVitalsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchHospitalization();
    void fetchPrescriptions();
    void fetchTimeline();
    void fetchVitals();
  }, [fetchHospitalization, fetchPrescriptions, fetchTimeline, fetchVitals]);

  const executionStats = useMemo(() => {
    const stats = new Map<
      string,
      { done: number; total: number; nextPending?: string }
    >();
    for (const execution of executions) {
      const prescriptionId = execution.prescription?.id;
      if (!prescriptionId) continue;
      const entry = stats.get(prescriptionId) ?? { done: 0, total: 0 };
      if (execution.status !== 'CANCELLED') {
        entry.total += 1;
        if (execution.status === 'DONE') entry.done += 1;
        if (
          execution.status === 'PENDING' &&
          (!entry.nextPending ||
            execution.scheduled_at < entry.nextPending)
        ) {
          entry.nextPending = execution.scheduled_at;
        }
      }
      stats.set(prescriptionId, entry);
    }
    return stats;
  }, [executions]);

  const timelineItems = useMemo(() => {
    const items: Array<{
      key: string;
      date: string;
      icon: typeof PawPrint;
      iconClass: string;
      title: string;
      description?: string;
      user?: string;
    }> = [];

    for (const event of events) {
      const base = {
        key: `event-${event.id}`,
        date: event.date,
        ...(event.created_by?.name ? { user: event.created_by.name } : {}),
      };
      if (event.type === 'WEIGHT') {
        const data = event.data as { value?: number; unit?: string };
        items.push({
          ...base,
          icon: Scale,
          iconClass: 'text-sky-700 dark:text-sky-500 bg-sky-50 dark:bg-sky-900',
          title: `Peso registrado: ${data.value ?? '—'} ${(data.unit ?? 'KG').toLowerCase()}`,
          ...(event.description ? { description: event.description } : {}),
        });
      } else if (event.type === 'CLINICAL_PARAMETERS') {
        const data = event.data as {
          values?: Array<{ name: string; value: string; unit?: string }>;
        };
        items.push({
          ...base,
          icon: Beaker,
          iconClass: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
          title: 'Parâmetros clínicos',
          description: (data.values ?? [])
            .map(
              (value) =>
                `${value.name}: ${value.value}${value.unit ? ` ${value.unit}` : ''}`,
            )
            .join(' · '),
        });
      } else if (event.type === 'OCCURRENCE') {
        items.push({
          ...base,
          icon: MessageSquarePlus,
          iconClass: 'text-amber-500 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10',
          title: event.title ?? 'Ocorrência',
          ...(event.description ? { description: event.description } : {}),
        });
      } else {
        items.push({
          ...base,
          icon: event.type === 'BOX_CHANGE' ? ArrowRightLeft : CalendarClock,
          iconClass: 'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800',
          title: event.title ?? EVENT_TYPE_LABELS[event.type],
          ...(event.description ? { description: event.description } : {}),
        });
      }
    }

    for (const execution of executions) {
      if (execution.status !== 'DONE' || !execution.executed_at) continue;
      items.push({
        key: `execution-${execution.id}`,
        date: execution.executed_at,
        icon: CheckCircle2,
        iconClass: 'text-emerald-700 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900',
        title: `Executado: ${execution.prescription?.name ?? ''}${
          doseLabel(execution.prescription) ? ` (${doseLabel(execution.prescription)})` : ''
        }`,
        ...(execution.notes ? { description: execution.notes } : {}),
        ...(execution.executed_by?.name ? { user: execution.executed_by.name } : {}),
      });
    }

    for (const vital of vitals) {
      items.push({
        key: `vital-${vital.id}`,
        date: vital.measured_at,
        icon: Activity,
        iconClass: 'text-teal-800 dark:text-teal-500 bg-teal-800/10 dark:bg-teal-500/10',
        title: 'Realizou uma nova aferição',
        ...(vital.notes ? { description: vital.notes } : {}),
        ...(vital.recorded_by?.name ? { user: vital.recorded_by.name } : {}),
      });
    }

    return items.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [events, executions, vitals]);

  if (!id) {
    return (
      <div className="text-center py-20 text-stone-500 dark:text-stone-400">
        Internação não encontrada.
      </div>
    );
  }

  if (loading || !hospitalization) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-teal-800 dark:text-teal-500" />
      </div>
    );
  }

  const isActive =
    hospitalization.status === 'TRIAGE' ||
    hospitalization.status === 'HOSPITALIZED';
  const status = STATUS_MAP[hospitalization.status];
  const risk = RISK_MAP[hospitalization.risk];

  const tutor = hospitalization.patient?.tutor;
  const restrictions = hospitalization.patient?.restrictions ?? [];
  const onDutyVet =
    hospitalization.on_duty_veterinarian ?? hospitalization.veterinarian;
  const patientSpecie = (hospitalization.patient?.specie ?? 'DOG') as Specie;
  const lastVital = vitals.length > 0 ? vitals[vitals.length - 1] : undefined;
  const cadence = evaluateCadence(
    hospitalization.monitoring_interval_minutes,
    lastVital?.measured_at,
  );

  const patientFacts = [
    {
      label: 'Espécie',
      value: SPECIE_LABELS[patientSpecie] ?? hospitalization.patient?.specie ?? '—',
    },
    { label: 'Raça', value: hospitalization.patient?.breed || '—' },
    {
      label: 'Sexo',
      value: SEX_LABELS[hospitalization.patient?.sex ?? ''] ?? '—',
    },
    {
      label: 'Idade',
      value: hospitalization.patient?.birth_date
        ? calcAge(new Date(hospitalization.patient.birth_date))
        : '—',
    },
    {
      label: 'Peso',
      value: hospitalization.weight_kg
        ? `${hospitalization.weight_kg.toLocaleString('pt-BR')} kg`
        : '—',
    },
  ];

  const refreshAll = () => {
    void fetchHospitalization();
    void fetchPrescriptions();
    void fetchTimeline();
    void fetchVitals();
  };

  const handleReopen = async () => {
    setReopenLoading(true);
    try {
      await monitoringService.reopen(hospitalization.id);
      setShowReopen(false);
      refreshAll();
    } finally {
      setReopenLoading(false);
    }
  };

  const handleStop = async () => {
    if (!stopping) return;
    setStopLoading(true);
    try {
      await monitoringService.stopPrescription(stopping.id);
      setStopping(null);
      void fetchPrescriptions();
    } finally {
      setStopLoading(false);
    }
  };

  const handleDeletePrescription = async () => {
    if (!deletingPrescription) return;
    setDeleteLoading(true);
    try {
      await monitoringService.deletePrescription(deletingPrescription.id);
      setDeletingPrescription(null);
      void fetchPrescriptions();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <button
              type="button"
              onClick={() => router.push('/monitoring')}
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 shrink-0 mt-1"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="p-3 rounded-xl bg-teal-800/10 dark:bg-teal-500/10 text-teal-800 dark:text-teal-500 shrink-0">
              <Stethoscope size={28} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/patients/detail?id=${hospitalization.patient?.id}`}
                  className="text-xl font-bold text-stone-900 dark:text-stone-100 hover:text-teal-800 dark:hover:text-teal-500"
                >
                  {hospitalization.patient?.name}
                </Link>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.badge}`}>
                  {status.label}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${risk.badge}`}>
                  {risk.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-stone-500 dark:text-stone-400">
                <span
                  className="flex items-center gap-1.5"
                  title="Veterinário responsável — quem deu entrada"
                >
                  <Stethoscope size={14} className="text-stone-500/70 dark:text-stone-400/70" />
                  <span className="font-semibold">Resp.</span>{' '}
                  {hospitalization.veterinarian?.name ?? '—'}
                </span>
                {onDutyVet && (
                  <span
                    className="flex items-center gap-1.5"
                    title="Veterinário de plantão — quem acompanha o paciente agora"
                  >
                    <UserCheck size={14} className="text-stone-500/70 dark:text-stone-400/70" />
                    <span className="font-semibold">Plantão</span>{' '}
                    {onDutyVet.name}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <BedDouble size={14} className="text-stone-500/70 dark:text-stone-400/70" />
                  {hospitalization.box?.name ?? 'Sem box'}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5">
                  <CalendarClock size={14} className="text-stone-500/70 dark:text-stone-400/70" />
                  Entrada {fmtDateTime(hospitalization.admitted_at)} (
                  {daysSince(hospitalization.admitted_at)} dia
                  {daysSince(hospitalization.admitted_at) === 1 ? '' : 's'})
                </span>
                {hospitalization.expected_discharge_at && isActive && (
                  <span className="flex items-center gap-1.5">
                    <MoveRight size={14} className="text-stone-500/70 dark:text-stone-400/70" />
                    Alta prevista {fmtDate(hospitalization.expected_discharge_at)}
                  </span>
                )}
                {hospitalization.discharged_at && (
                  <span className="flex items-center gap-1.5">
                    <MoveRight size={14} className="text-stone-500/70 dark:text-stone-400/70" />
                    Saída {fmtDateTime(hospitalization.discharged_at)}
                    {hospitalization.discharge_reason
                      ? ` · ${DISCHARGE_REASON_LABELS[hospitalization.discharge_reason]}`
                      : ''}
                  </span>
                )}
              </div>
              {restrictions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-200/70 dark:border-stone-800/70">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500/70 dark:text-stone-400/70 mb-1.5">
                    Restrições
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {restrictions.map((restriction) => (
                      <span
                        key={restriction}
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300"
                      >
                        {capitalize(restriction)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tutor && (
                <div className="mt-3 pt-3 border-t border-stone-200/70 dark:border-stone-800/70">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500/70 dark:text-stone-400/70 mb-1.5">
                    Tutor
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <User size={14} className="text-stone-500/70 dark:text-stone-400/70 shrink-0" />
                      {tutor.name}
                    </span>
                    {tutor.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} className="text-stone-500/70 dark:text-stone-400/70 shrink-0" />
                        {formatPhone(tutor.phone)}
                        <a
                          href={buildWhatsAppLink(
                            tutor.phone,
                            tutor.name,
                            hospitalization.patient?.name ?? '',
                            hospitalization.patient?.sex,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Conversar com ${tutor.name} no WhatsApp`}
                          className="text-emerald-700 dark:text-emerald-500"
                        >
                          <WhatsAppIcon />
                        </a>
                      </span>
                    )}
                    {tutor.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-stone-500/70 dark:text-stone-400/70 shrink-0" />
                        {tutor.address}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {isActive ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
                  <Pencil size={14} />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowMoveBox(true)}>
                  <ArrowRightLeft size={14} />
                  Mover box
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCloseAction('discharge')}
                  className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
                >
                  <FileDown size={14} />
                  Registrar alta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCloseAction('decease')}
                  className="text-stone-500 dark:text-stone-400"
                >
                  <Skull size={14} />
                  Óbito
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCloseAction('cancel')}
                  className="text-red-600 dark:text-red-500 border-red-600/30 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-900"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReopen(true)}
              >
                <RotateCcw size={14} />
                Reabrir internação
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-200/70 dark:border-stone-800/70">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500/70 dark:text-stone-400/70 mb-2">
            Informações do paciente
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {patientFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/70 dark:border-stone-800/70 px-3 py-2"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500/70 dark:text-stone-400/70">
                  {fact.label}
                </p>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {(hospitalization.complaint ||
          hospitalization.diagnosis ||
          hospitalization.prognosis ||
          hospitalization.accessories ||
          hospitalization.observations ||
          hospitalization.discharge_notes) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 mt-4 pt-4 border-t border-stone-200/70 dark:border-stone-800/70 text-sm">
            {hospitalization.complaint && (
              <div>
                <p className="text-xs font-semibold text-stone-500/70 dark:text-stone-400/70 uppercase tracking-wide">Queixa</p>
                <p className="text-stone-800 dark:text-stone-100">{hospitalization.complaint}</p>
              </div>
            )}
            {hospitalization.diagnosis && (
              <div>
                <p className="text-xs font-semibold text-stone-500/70 dark:text-stone-400/70 uppercase tracking-wide">Diagnóstico</p>
                <p className="text-stone-800 dark:text-stone-100">{hospitalization.diagnosis}</p>
              </div>
            )}
            {hospitalization.prognosis && (
              <div>
                <p className="text-xs font-semibold text-stone-500/70 dark:text-stone-400/70 uppercase tracking-wide">Prognóstico</p>
                <p className="text-stone-800 dark:text-stone-100">{hospitalization.prognosis}</p>
              </div>
            )}
            {hospitalization.accessories && (
              <div>
                <p className="text-xs font-semibold text-stone-500/70 dark:text-stone-400/70 uppercase tracking-wide">Acessórios</p>
                <p className="text-stone-800 dark:text-stone-100">{hospitalization.accessories}</p>
              </div>
            )}
            {hospitalization.observations && (
              <div>
                <p className="text-xs font-semibold text-stone-500/70 dark:text-stone-400/70 uppercase tracking-wide">Observações</p>
                <p className="text-stone-800 dark:text-stone-100">{hospitalization.observations}</p>
              </div>
            )}
            {hospitalization.discharge_notes && (
              <div>
                <p className="text-xs font-semibold text-stone-500/70 dark:text-stone-400/70 uppercase tracking-wide">Notas do encerramento</p>
                <p className="text-stone-800 dark:text-stone-100">{hospitalization.discharge_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-b border-stone-200 dark:border-stone-800 overflow-x-auto overflow-y-hidden scrollbar-thin">
        <nav className="flex gap-1 min-w-max">
          <button
            type="button"
            onClick={() => setDetailTab('care')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              detailTab === 'care'
                ? 'border-teal-800 dark:border-teal-500 text-teal-800 dark:text-teal-500'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:border-teal-800/30 dark:hover:border-teal-500/30'
            }`}
          >
            <Activity size={16} />
            Acompanhamento
          </button>
          <button
            type="button"
            onClick={() => setDetailTab('history')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              detailTab === 'history'
                ? 'border-teal-800 dark:border-teal-500 text-teal-800 dark:text-teal-500'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:border-teal-800/30 dark:hover:border-teal-500/30'
            }`}
          >
            <History size={16} />
            Histórico da Internação
          </button>
        </nav>
      </div>

      {detailTab === 'care' && (
        <>
          <SectionCard
            title="Sinais Vitais"
            subtitle={
              cadence?.overdue
                ? cadence.neverMeasured
                  ? 'Nenhuma aferição registrada desde a admissão'
                  : `Aferição atrasada há ${formatVitalDuration(-(cadence.minutesUntilDue ?? 0))}`
                : 'Aferições da internação, com faixas de referência por espécie'
            }
            headerAction={
              isActive ? (
                <Button
                  size="sm"
                  onClick={() => setShowVitalsModal(true)}
                  className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
                >
                  <Plus size={14} />
              Aferição
                </Button>
              ) : undefined
            }
          >
            {vitalsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-teal-800 dark:text-teal-500" size={24} />
              </div>
            ) : (
              <div className="space-y-4">
                <VitalSummaryCards specie={patientSpecie} records={vitals} />

                {vitals.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {VITAL_DEFINITIONS.map((definition) => (
                      <VitalsChart
                        key={definition.key}
                        specie={patientSpecie}
                        definition={definition}
                        records={vitals}
                      />
                    ))}
                  </div>
                )}

                <VitalHistoryTable specie={patientSpecie} records={vitals} />
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Prescrição Médica"
            subtitle="Medicamentos, procedimentos e fluidoterapias programados"
            headerAction={
              isActive ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApplyTemplate(true)}
                  >
                    <ClipboardList size={14} />
                Carregar de modelo
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowPrescription(true)}
                    className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
                  >
                    <Plus size={14} />
                Prescrição
                  </Button>
                </div>
              ) : undefined
            }
          >
            {prescriptionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-teal-800 dark:text-teal-500" />
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <Pill size={40} className="mx-auto text-stone-500/50 dark:text-stone-400/50 mb-2" />
                <p className="text-stone-500 dark:text-stone-400 text-sm">
              Nenhuma prescrição registrada
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {prescriptions.map((prescription) => {
                  const stats = executionStats.get(prescription.id);
                  const typeInfo = PRESCRIPTION_TYPE_MAP[prescription.type];
                  return (
                    <div
                      key={prescription.id}
                      className={`p-3 rounded-lg border border-stone-200 dark:border-stone-800 ${
                        prescription.status === 'STOPPED' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                              {prescription.name}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeInfo.badge}`}>
                              {typeInfo.label}
                            </span>
                            {prescription.status === 'STOPPED' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                            Interrompida
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {FREQUENCY_LABELS[prescription.frequency]}
                            {prescription.frequency === 'RECURRING'
                              ? ` · a cada ${prescription.interval_hours}h por ${prescription.duration_days} dia(s)`
                              : ''}
                            {doseLabel(prescription) ? ` · ${doseLabel(prescription)}` : ''}
                            {prescription.frequency !== 'AS_NEEDED'
                              ? ` · início ${fmtDateTime(prescription.start_at)}`
                              : ''}
                          </p>
                          {stats && stats.total > 0 && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-700 dark:text-emerald-500" />
                              {stats.done}/{stats.total} execuções concluídas
                              {stats.nextPending
                                ? ` · próxima ${fmtDateTime(stats.nextPending)}`
                                : ''}
                            </p>
                          )}
                          {prescription.notes && (
                            <p className="text-xs text-stone-500/70 dark:text-stone-400/70 italic mt-0.5">
                              {prescription.notes}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <div className="flex gap-1 shrink-0">
                            {prescription.frequency === 'AS_NEEDED' &&
                          prescription.status === 'ACTIVE' && (
                              <Button
                                size="sm"
                                onClick={() => setExecutingSOS(prescription)}
                                disabled={hospitalization.status === 'TRIAGE'}
                                className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
                                title={
                                  hospitalization.status === 'TRIAGE'
                                    ? 'Disponível quando o paciente estiver Internado'
                                    : 'Registrar aplicação SOS'
                                }
                              >
                              Executar SOS
                              </Button>
                            )}
                            {prescription.status === 'ACTIVE' &&
                          prescription.frequency !== 'AS_NEEDED' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setRescheduling(prescription)}
                                  title="Interromper e reprogramar"
                                >
                                  <Clock size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setStopping(prescription)}
                                  title="Interromper"
                                  className="text-amber-600 dark:text-amber-400"
                                >
                                  <OctagonPause size={14} />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeletingPrescription(prescription)}
                              title="Excluir (apenas se nunca executada)"
                              className="text-red-600 dark:text-red-500"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </>
      )}

      {detailTab === 'history' && (
        <SectionCard
          title="Histórico da Internação"
          subtitle="Execuções, ocorrências, pesos e parâmetros em ordem cronológica"
          headerAction={
            isActive ? (
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setQuickAdd('occurrence')}>
                  <MessageSquarePlus size={14} />
                Ocorrência
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuickAdd('weight')}>
                  <Scale size={14} />
                Peso
                </Button>
              </div>
            ) : undefined
          }
        >
          {timelineLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-teal-800 dark:text-teal-500" />
            </div>
          ) : timelineItems.length === 0 ? (
            <div className="text-center py-8">
              <CalendarClock size={40} className="mx-auto text-stone-500/50 dark:text-stone-400/50 mb-2" />
              <p className="text-stone-500 dark:text-stone-400 text-sm">
              Nenhum registro ainda
              </p>
            </div>
          ) : (
            <div>
              {timelineItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex gap-3">
                    <div className="w-20 shrink-0 text-right pt-1">
                      <p className="text-xs font-semibold text-stone-800 dark:text-stone-100 tabular-nums">
                        {fmtDate(item.date)}
                      </p>
                      <p className="text-[11px] text-stone-500/70 dark:text-stone-400/70 tabular-nums">
                        {fmtTime(item.date)}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span
                        className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.iconClass}`}
                      >
                        <Icon size={14} />
                      </span>
                      {index < timelineItems.length - 1 && (
                        <span className="w-px flex-1 bg-stone-100 dark:bg-stone-800" />
                      )}
                    </div>
                    <div
                      className={`min-w-0 flex-1 pt-1 ${
                        index < timelineItems.length - 1 ? 'pb-7' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          {item.description}
                        </p>
                      )}
                      {item.user && (
                        <p className="text-[11px] text-stone-500/70 dark:text-stone-400/70 mt-0.5">
                          {item.user}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {showEdit && (
        <HospitalizeModal
          hospitalization={hospitalization}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            refreshAll();
          }}
        />
      )}
      {showMoveBox && (
        <MoveBoxModal
          hospitalization={hospitalization}
          onClose={() => setShowMoveBox(false)}
          onSuccess={() => {
            setShowMoveBox(false);
            refreshAll();
          }}
        />
      )}
      {closeAction && (
        <CloseActionModal
          action={closeAction}
          hospitalizationId={hospitalization.id}
          onClose={() => setCloseAction(null)}
          onSuccess={() => {
            setCloseAction(null);
            refreshAll();
          }}
        />
      )}
      {showReopen && (
        <ConfirmModal
          title="Reabrir internação"
          description="A internação voltará para a situação Internado. Deseja continuar?"
          confirmLabel="Reabrir"
          variant="default"
          loading={reopenLoading}
          onConfirm={() => void handleReopen()}
          onClose={() => setShowReopen(false)}
        />
      )}
      {showVitalsModal && (
        <VitalSignsModal
          hospitalizationId={hospitalization.id}
          specie={patientSpecie}
          onClose={() => setShowVitalsModal(false)}
          onSuccess={() => {
            setShowVitalsModal(false);
            void fetchVitals();
            void fetchTimeline();
          }}
        />
      )}
      {showPrescription && (
        <PrescriptionModal
          hospitalizationId={hospitalization.id}
          patientName={hospitalization.patient?.name}
          onClose={() => setShowPrescription(false)}
          onSuccess={() => {
            setShowPrescription(false);
            void fetchPrescriptions();
          }}
        />
      )}
      {showApplyTemplate && (
        <ApplyTemplateModal
          hospitalizationId={hospitalization.id}
          patientName={hospitalization.patient?.name}
          onClose={() => setShowApplyTemplate(false)}
          onSuccess={() => {
            setShowApplyTemplate(false);
            void fetchPrescriptions();
          }}
        />
      )}
      {stopping && (
        <ConfirmModal
          title="Interromper prescrição"
          description={`As execuções pendentes de "${stopping.name}" serão canceladas. Deseja continuar?`}
          confirmLabel="Interromper"
          variant="danger"
          loading={stopLoading}
          onConfirm={() => void handleStop()}
          onClose={() => setStopping(null)}
        />
      )}
      {rescheduling && (
        <RescheduleModal
          prescription={rescheduling}
          onClose={() => setRescheduling(null)}
          onSuccess={() => {
            setRescheduling(null);
            void fetchPrescriptions();
          }}
        />
      )}
      {deletingPrescription && (
        <ConfirmModal
          title="Excluir prescrição"
          description={`Tem certeza que deseja excluir "${deletingPrescription.name}"? Só é possível excluir prescrições que nunca foram executadas.`}
          confirmLabel="Excluir"
          variant="danger"
          loading={deleteLoading}
          onConfirm={() => void handleDeletePrescription()}
          onClose={() => setDeletingPrescription(null)}
        />
      )}
      {executingSOS && (
        <ExecuteModal
          prescription={executingSOS}
          patientName={hospitalization.patient?.name}
          onClose={() => setExecutingSOS(null)}
          onSuccess={() => {
            setExecutingSOS(null);
            void fetchPrescriptions();
            void fetchTimeline();
          }}
        />
      )}
      {quickAdd === 'occurrence' && (
        <OccurrenceModal
          hospitalizationId={hospitalization.id}
          patientName={hospitalization.patient?.name}
          onClose={() => setQuickAdd(null)}
          onSuccess={() => {
            setQuickAdd(null);
            void fetchTimeline();
          }}
        />
      )}
      {quickAdd === 'weight' && (
        <WeightModal
          hospitalizationId={hospitalization.id}
          patientName={hospitalization.patient?.name}
          onClose={() => setQuickAdd(null)}
          onSuccess={() => {
            setQuickAdd(null);
            void fetchTimeline();
          }}
        />
      )}
    </div>
  );
}
