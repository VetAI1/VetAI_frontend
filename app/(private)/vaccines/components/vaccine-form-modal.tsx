'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { Modal } from '@/app/components/common/modal';
import { notifyMutationSuccess } from '@/app/components/common/mutation-feedback';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import {
  vaccineCatalogSchema,
  type VaccineCatalogFormData,
} from '@/schemas/vaccine';
import { vaccinesService } from '@/services/vaccines.service';
import type { Vaccine } from '@/types/vaccine';

const PERIOD_OPTIONS = [
  { label: 'Sem revacinação', value: undefined },
  { label: '30 dias', value: 30 },
  { label: '60 dias', value: 60 },
  { label: '90 dias', value: 90 },
  { label: '6 meses (180 dias)', value: 180 },
  { label: '1 ano (365 dias)', value: 365 },
  { label: '2 anos (730 dias)', value: 730 },
] as const;

interface VaccineFormModalProps {
  vaccine?: Vaccine;
  onClose: () => void;
  onSuccess: () => void;
}

export function VaccineFormModal({
  vaccine,
  onClose,
  onSuccess,
}: VaccineFormModalProps) {
  const isEdit = !!vaccine;
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VaccineCatalogFormData>({
    resolver: yupResolver(
      vaccineCatalogSchema,
    ) as Resolver<VaccineCatalogFormData>,
    defaultValues: {
      name: vaccine?.name ?? '',
      period: vaccine?.revaccination_period_days,
    },
  });

  const onSubmit = async (data: VaccineCatalogFormData) => {
    setSaving(true);
    try {
      if (isEdit) {
        await vaccinesService.update(vaccine.id, {
          name: data.name.trim(),
          ...(data.period != null
            ? { revaccination_period_days: data.period }
            : {}),
        });
      } else {
        await vaccinesService.create({
          name: data.name.trim(),
          ...(data.period != null
            ? { revaccination_period_days: data.period }
            : {}),
        });
      }
      notifyMutationSuccess(
        isEdit ? 'Vacina atualizada com sucesso.' : 'Vacina criada com sucesso.',
      );
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Editar Vacina' : 'Nova Vacina'}
      description={
        isEdit
          ? 'Atualize os dados da vacina'
          : 'Adicione uma nova vacina ao catálogo do workspace'
      }
      onClose={onClose}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Nome"
              required
              value={field.value}
              onChange={field.onChange}
              placeholder="Ex: Raiva, V8, Giárdia..."
              error={errors.name?.message}
              autoFocus
            />
          )}
        />

        <div>
          <Controller
            name="period"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Período de Revacinação"
                value={field.value !== null ? String(field.value) : ''}
                onChange={(v) => field.onChange(v ? Number(v) : null)}
                options={PERIOD_OPTIONS.map((opt) => ({
                  value: opt.value !== undefined ? String(opt.value) : '',
                  label: opt.label,
                }))}
              />
            )}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Usado para calcular automaticamente a próxima revacinação ao
            registrar uma dose.
          </p>
        </div>

        {isEdit && (
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground">
              Código:{' '}
              <span className="font-mono font-medium text-secondary-foreground">
                {vaccine.code}
              </span>
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isEdit ? 'Salvar' : 'Criar Vacina'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
