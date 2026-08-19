'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Beaker, Clock, MessageSquarePlus, Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { fmtDateTime } from '../utils';

import { Modal } from '@/app/components/common/modal';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import {
  monitoringWeightSchema,
  occurrenceSchema,
  type MonitoringWeightFormData,
  type OccurrenceFormData,
} from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type { ClinicalParameter } from '@/types/monitoring';

export type QuickAddKind = 'occurrence' | 'weight' | 'parameters';

interface QuickAddChooserProps {
  patientName?: string;
  onChoose: (kind: QuickAddKind) => void;
  onClose: () => void;
}

export function QuickAddChooserModal({
  patientName,
  onChoose,
  onClose,
}: QuickAddChooserProps) {
  const options = [
    {
      kind: 'occurrence' as const,
      label: 'Ocorrência',
      description: 'Registre algo relevante que aconteceu',
      icon: MessageSquarePlus,
    },
    {
      kind: 'weight' as const,
      label: 'Peso',
      description: 'Registre uma pesagem do paciente',
      icon: Scale,
    },
    {
      kind: 'parameters' as const,
      label: 'Parâmetros clínicos',
      description: 'Temperatura, apetite, hidratação e mais',
      icon: Beaker,
    },
  ];

  return (
    <Modal
      title="Novo registro"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="sm"
    >
      <div className="space-y-2">
        {options.map(({ kind, label, description, icon: Icon }) => (
          <button
            key={kind}
            type="button"
            onClick={() => onChoose(kind)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-teal-800 dark:hover:border-teal-500 hover:bg-teal-800/10 dark:hover:bg-teal-500/10 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-teal-800/10 dark:bg-teal-500/10 text-teal-800 dark:text-teal-500 shrink-0">
              <Icon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{label}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

interface QuickAddBaseProps {
  hospitalizationId: string;
  patientName?: string;
  recordedAt?: string;
  onClose: () => void;
  onSuccess: () => void;
}

function recordDate(recordedAt?: string): string {
  return recordedAt ?? new Date().toISOString();
}

function RecordTimeHint({ recordedAt }: { recordedAt?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 px-3 py-2.5 text-xs text-stone-500 dark:text-stone-400">
      <Clock size={14} className="mt-px shrink-0" />
      <span>
        {recordedAt
          ? `Será registrado em ${fmtDateTime(recordedAt)}, o horário do slot selecionado.`
          : 'A data e o horário são registrados automaticamente no momento do envio.'}
      </span>
    </div>
  );
}

export function OccurrenceModal({
  hospitalizationId,
  patientName,
  recordedAt,
  onClose,
  onSuccess,
}: QuickAddBaseProps) {
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OccurrenceFormData>({
    resolver: yupResolver(occurrenceSchema) as Resolver<OccurrenceFormData>,
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: OccurrenceFormData) => {
    setSaving(true);
    try {
      await monitoringService.createEvent(hospitalizationId, {
        type: 'OCCURRENCE',
        date: recordDate(recordedAt),
        title: data.title,
        ...(data.description ? { description: data.description } : {}),
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Registrar Ocorrência"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <RecordTimeHint {...(recordedAt ? { recordedAt } : {})} />
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Resumo"
              required
              placeholder="Ex: Vômito após medicação"
              value={field.value}
              onChange={field.onChange}
              error={errors.title?.message}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label="Descrição"
              rows={3}
              placeholder="Detalhe o que aconteceu"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.description?.message}
            />
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function WeightModal({
  hospitalizationId,
  patientName,
  recordedAt,
  onClose,
  onSuccess,
}: QuickAddBaseProps) {
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MonitoringWeightFormData>({
    resolver: yupResolver(
      monitoringWeightSchema,
    ) as Resolver<MonitoringWeightFormData>,
    defaultValues: {
      value: '',
      unit: 'KG',
      notes: '',
    },
  });

  const onSubmit = async (data: MonitoringWeightFormData) => {
    setSaving(true);
    try {
      await monitoringService.createEvent(hospitalizationId, {
        type: 'WEIGHT',
        date: recordDate(recordedAt),
        ...(data.notes ? { description: data.notes } : {}),
        data: {
          value: Number(data.value.replace(',', '.')),
          unit: data.unit,
        },
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Registrar Peso"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <RecordTimeHint {...(recordedAt ? { recordedAt } : {})} />
        <div className="flex gap-3">
          <div className="flex-1">
            <Controller
              name="value"
              control={control}
              render={({ field }) => (
                <InputWithLabel
                  label="Peso"
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 12.5"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.value?.message}
                />
              )}
            />
          </div>
          <div className="w-24">
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <SelectInput
                  label="Unidade"
                  value={field.value}
                  onChange={(value) => field.onChange(value as 'KG' | 'G')}
                  options={[
                    { value: 'KG', label: 'kg' },
                    { value: 'G', label: 'g' },
                  ]}
                  error={errors.unit?.message}
                />
              )}
            />
          </div>
        </div>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Anotação"
              placeholder="Opcional"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.notes?.message}
            />
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ParametersModal({
  hospitalizationId,
  patientName,
  recordedAt,
  onClose,
  onSuccess,
}: QuickAddBaseProps) {
  const [saving, setSaving] = useState(false);
  const [parameters, setParameters] = useState<ClinicalParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void monitoringService
      .listParameters()
      .then((data) => setParameters(data.filter((parameter) => parameter.active)))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const filled = parameters
      .filter((parameter) => values[parameter.id]?.trim())
      .map((parameter) => ({
        name: parameter.name,
        value: values[parameter.id]?.trim() ?? '',
        ...(parameter.unit ? { unit: parameter.unit } : {}),
      }));

    if (!filled.length) {
      setError('Preencha ao menos um parâmetro');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await monitoringService.createEvent(hospitalizationId, {
        type: 'CLINICAL_PARAMETERS',
        date: recordDate(recordedAt),
        data: { values: filled },
      });
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Registrar Parâmetros Clínicos"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <RecordTimeHint {...(recordedAt ? { recordedAt } : {})} />
        {loading ? (
          <p className="text-sm text-stone-500 dark:text-stone-400 py-4 text-center">
            Carregando parâmetros...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parameters.map((parameter) => (
              <InputWithLabel
                key={parameter.id}
                label={
                  parameter.unit
                    ? `${parameter.name} (${parameter.unit})`
                    : parameter.name
                }
                placeholder={parameter.example ? `Ex: ${parameter.example}` : '—'}
                value={values[parameter.id] ?? ''}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [parameter.id]: e.target.value,
                  }))
                }
              />
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
