'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { Modal } from '@/app/components/common/modal';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import {
  prescriptionFormSchema,
  type PrescriptionFormData,
} from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type { CreatePrescriptionPayload, DoseUnit } from '@/types/monitoring';

const TYPE_OPTIONS = [
  { value: 'MEDICATION', label: 'Medicamento' },
  { value: 'PROCEDURE', label: 'Procedimento' },
  { value: 'FLUID', label: 'Fluidoterapia' },
];

const FREQUENCY_OPTIONS = [
  { value: 'RECURRING', label: 'Recorrente' },
  { value: 'ONCE', label: 'Apenas uma vez' },
  { value: 'AS_NEEDED', label: 'Quando necessário (SOS)' },
];

const DOSE_UNIT_OPTIONS = [
  { value: '', label: 'Sem dose' },
  { value: 'MG', label: 'mg' },
  { value: 'MCG', label: 'mcg' },
  { value: 'G', label: 'g' },
  { value: 'ML', label: 'ml' },
  { value: 'ML_H', label: 'ml/h' },
  { value: 'TABLET', label: 'comprimido(s)' },
  { value: 'CAPSULE', label: 'cápsula(s)' },
  { value: 'DROP', label: 'gota(s)' },
];

interface PrescriptionModalProps {
  hospitalizationId: string;
  patientName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PrescriptionModal({
  hospitalizationId,
  patientName,
  onClose,
  onSuccess,
}: PrescriptionModalProps) {
  const [saving, setSaving] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: yupResolver(
      prescriptionFormSchema,
    ) as Resolver<PrescriptionFormData>,
    defaultValues: {
      type: 'MEDICATION',
      name: '',
      dose_value: '',
      dose_unit: '',
      frequency: 'RECURRING',
      interval_hours: '',
      duration_days: '',
      notes: '',
    },
  });

  const frequency = watch('frequency');
  const type = watch('type');

  const onSubmit = async (data: PrescriptionFormData) => {
    setSaving(true);
    try {
      const doseValue = data.dose_value
        ? Number(data.dose_value.replace(',', '.'))
        : undefined;

      const payload: CreatePrescriptionPayload = {
        type: data.type,
        name: data.name,
        frequency: data.frequency,
        start_at: new Date().toISOString(),
        ...(doseValue && data.dose_unit
          ? { dose_value: doseValue, dose_unit: data.dose_unit as DoseUnit }
          : {}),
        ...(data.frequency === 'RECURRING'
          ? {
            interval_hours: Number(data.interval_hours),
            duration_days: Number(data.duration_days),
          }
          : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      };

      await monitoringService.createPrescription(hospitalizationId, payload);

      if (saveAsTemplate) {
        await monitoringService.createTemplate({
          name: data.name,
          items: [
            {
              type: data.type,
              name: data.name,
              frequency: data.frequency,
              ...(doseValue && data.dose_unit
                ? {
                  dose_value: doseValue,
                  dose_unit: data.dose_unit as DoseUnit,
                }
                : {}),
              ...(data.frequency === 'RECURRING'
                ? {
                  interval_hours: Number(data.interval_hours),
                  duration_days: Number(data.duration_days),
                }
                : {}),
              ...(data.notes ? { notes: data.notes } : {}),
            },
          ],
        });
      }

      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Nova Prescrição"
      description={patientName ? `Paciente: ${patientName}` : undefined}
      onClose={onClose}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Tipo"
                required
                value={field.value}
                onChange={field.onChange}
                options={TYPE_OPTIONS}
                error={errors.type?.message}
              />
            )}
          />
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Frequência"
                required
                value={field.value}
                onChange={field.onChange}
                options={FREQUENCY_OPTIONS}
                error={errors.frequency?.message}
              />
            )}
          />
        </div>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label={
                type === 'MEDICATION'
                  ? 'Medicamento'
                  : type === 'FLUID'
                    ? 'Fluidoterapia'
                    : 'Procedimento'
              }
              required
              placeholder={
                type === 'MEDICATION'
                  ? 'Ex: Dipirona 500mg'
                  : type === 'FLUID'
                    ? 'Ex: NaCl 0,9%'
                    : 'Ex: Curativo da ferida cirúrgica'
              }
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="dose_value"
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label="Dose"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 0.5 (aceita fração)"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.dose_value?.message}
              />
            )}
          />
          <Controller
            name="dose_unit"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Unidade"
                value={field.value ?? ''}
                onChange={field.onChange}
                options={DOSE_UNIT_OPTIONS}
                error={errors.dose_unit?.message}
              />
            )}
          />
        </div>

        {frequency === 'RECURRING' && (
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="interval_hours"
              control={control}
              render={({ field }) => (
                <InputWithLabel
                  label="A cada (horas)"
                  required
                  type="number"
                  min="1"
                  placeholder="Ex: 8"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.interval_hours?.message}
                />
              )}
            />
            <Controller
              name="duration_days"
              control={control}
              render={({ field }) => (
                <InputWithLabel
                  label="Durante (dias)"
                  required
                  type="number"
                  min="1"
                  placeholder="Ex: 3"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.duration_days?.message}
                />
              )}
            />
          </div>
        )}

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <FormTextarea
              label="Observações"
              rows={2}
              placeholder="Ex: Aplicar após alimentação"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.notes?.message}
            />
          )}
        />

        <label className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
            className="rounded border-stone-200 dark:border-stone-800 text-teal-800 dark:text-teal-500 focus:ring-teal-600 dark:focus:ring-teal-500"
          />
          Salvar também como modelo de prescrição
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
          >
            Prescrever
          </Button>
        </div>
      </form>
    </Modal>
  );
}
