'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Beaker, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { ConfirmModal } from '@/app/components/common/confirm-modal';
import { Modal } from '@/app/components/common/modal';
import { SectionCard } from '@/app/components/data/section-card';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { Button } from '@/components/ui/button';
import {
  clinicalParameterSchema,
  type ClinicalParameterFormData,
} from '@/schemas/monitoring';
import { monitoringService } from '@/services/monitoring.service';
import type { ClinicalParameter } from '@/types/monitoring';

interface ParameterFormModalProps {
  parameter?: ClinicalParameter;
  onClose: () => void;
  onSuccess: () => void;
}

function ParameterFormModal({
  parameter,
  onClose,
  onSuccess,
}: ParameterFormModalProps) {
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicalParameterFormData>({
    resolver: yupResolver(
      clinicalParameterSchema,
    ) as Resolver<ClinicalParameterFormData>,
    defaultValues: {
      name: parameter?.name ?? '',
      unit: parameter?.unit ?? '',
      example: parameter?.example ?? '',
      value_type: parameter?.value_type ?? 'TEXT',
    },
  });

  const onSubmit = async (data: ClinicalParameterFormData) => {
    setSaving(true);
    try {
      if (parameter) {
        await monitoringService.updateParameter(parameter.id, {
          name: data.name,
          unit: data.unit || undefined,
          example: data.example || undefined,
          value_type: data.value_type,
        });
      } else {
        await monitoringService.createParameter({
          name: data.name,
          ...(data.unit ? { unit: data.unit } : {}),
          ...(data.example ? { example: data.example } : {}),
          value_type: data.value_type,
        });
      }
      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={parameter ? 'Editar Parâmetro' : 'Novo Parâmetro Clínico'}
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
              placeholder="Ex: Glicemia"
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <InputWithLabel
                label="Unidade"
                placeholder="Ex: mg/dL (opcional)"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.unit?.message}
              />
            )}
          />
          <Controller
            name="value_type"
            control={control}
            render={({ field }) => (
              <SelectInput
                label="Tipo do valor"
                required
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'NUMBER', label: 'Número' },
                  { value: 'TEXT', label: 'Texto' },
                ]}
                error={errors.value_type?.message}
              />
            )}
          />
        </div>
        <Controller
          name="example"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Exemplo de preenchimento"
              placeholder="Ex: 38,5 ou Normal, reduzido, ausente"
              tooltip="Aparece como dica dentro do campo na hora de registrar os sinais vitais."
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.example?.message}
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

export function ParametersTab() {
  const [parameters, setParameters] = useState<ClinicalParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClinicalParameter | null>(null);
  const [deleting, setDeleting] = useState<ClinicalParameter | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchParameters = useCallback(async () => {
    setLoading(true);
    try {
      setParameters(await monitoringService.listParameters());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchParameters();
  }, [fetchParameters]);

  const toggleActive = async (parameter: ClinicalParameter) => {
    await monitoringService.updateParameter(parameter.id, {
      active: !parameter.active,
    });
    void fetchParameters();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await monitoringService.deleteParameter(deleting.id);
      setDeleting(null);
      void fetchParameters();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SectionCard
      title="Parâmetros Clínicos"
      subtitle="Defina o que a equipe registra na evolução dos pacientes (temperatura, apetite, hidratação...)"
      headerAction={
        <Button
          onClick={() => setShowForm(true)}
          className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
        >
          <Plus size={16} />
          Novo parâmetro
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-teal-800 dark:text-teal-500" />
        </div>
      ) : parameters.length === 0 ? (
        <div className="text-center py-12">
          <Beaker size={48} className="mx-auto text-stone-500/50 dark:text-stone-400/50 mb-3" />
          <p className="text-stone-500 dark:text-stone-400">Nenhum parâmetro cadastrado</p>
        </div>
      ) : (
        <div className="divide-y divide-border/70">
          {parameters.map((parameter) => (
            <div
              key={parameter.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0 flex items-center gap-2">
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  {parameter.name}
                  {parameter.unit && (
                    <span className="text-stone-500/70 dark:text-stone-400/70 font-normal">
                      {' '}
                      ({parameter.unit})
                    </span>
                  )}
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 shrink-0">
                  {parameter.value_type === 'NUMBER' ? 'Número' : 'Texto'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void toggleActive(parameter)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                    parameter.active
                      ? 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-500'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                  }`}
                  title="Clique para alternar"
                >
                  {parameter.active ? 'Ativo' : 'Inativo'}
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(parameter)}
                  title="Editar"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleting(parameter)}
                  title="Excluir"
                  className="text-red-600 dark:text-red-500"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editing) && (
        <ParameterFormModal
          {...(editing ? { parameter: editing } : {})}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditing(null);
            void fetchParameters();
          }}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Excluir parâmetro"
          description={`Tem certeza que deseja excluir "${deleting.name}"?`}
          confirmLabel="Excluir"
          variant="danger"
          loading={deleteLoading}
          onConfirm={() => void handleDelete()}
          onClose={() => setDeleting(null)}
        />
      )}
    </SectionCard>
  );
}
