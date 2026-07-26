'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Building2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/infra/auth-context';
import { hospitalSchema, type HospitalFormData } from '@/schemas/hospital';
import { hospitalsService } from '@/services/hospitals.service';
import { formatCEP, formatCNPJ, unmaskCEP, unmaskCNPJ } from '@/utils/masks';

export default function SettingsPage() {
  const { can } = useAuth();
  const canEdit = can('settings:edit');
  const [loading, setLoading] = useState(true);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HospitalFormData>({ resolver: yupResolver(hospitalSchema) });

  useEffect(() => {
    void hospitalsService
      .get()
      .then((hospital) => {
        if (!hospital?.address || !hospital.responsible) return;
        reset({
          name: hospital.name,
          cnpj: formatCNPJ(hospital.cnpj ?? ''),
          crmv: hospital.crmv ?? '',
          address: {
            zipCode: formatCEP(hospital.address.zip_code),
            street: hospital.address.street,
            number: hospital.address.number,
            complement: hospital.address.complement ?? '',
            neighborhood: hospital.address.neighborhood,
            city: hospital.address.city,
            state: hospital.address.state,
          },
          responsible: hospital.responsible,
        });
      })
      .catch(() => toast.error('Não foi possível carregar as configurações.'))
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(data: HospitalFormData) {
    try {
      await hospitalsService.update({
        ...data,
        cnpj: unmaskCNPJ(data.cnpj),
        address: {
          zip_code: unmaskCEP(data.address.zipCode),
          street: data.address.street,
          number: data.address.number,
          neighborhood: data.address.neighborhood,
          city: data.address.city,
          state: data.address.state,
          ...(data.address.complement
            ? { complement: data.address.complement }
            : {}),
        },
      });
      toast.success('Configurações da clínica atualizadas.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar.');
    }
  }

  if (loading) {
    return <p className="p-6 text-sm text-slate-500">Carregando configurações...</p>;
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-teal-100 p-3 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Configurações da clínica
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Atualize os dados usados para identificar sua clínica.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
          <h2 className="mb-5 font-semibold text-slate-900 dark:text-white">Identificação</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <InputWithLabel label="Nome da clínica" name="name" control={control} error={errors.name?.message} disabled={!canEdit} required />
            <InputWithLabel label="CNPJ" name="cnpj" control={control} error={errors.cnpj?.message} onChange={(event) => setValue('cnpj', formatCNPJ(event.target.value), { shouldValidate: true })} disabled={!canEdit} maxLength={18} required />
            <InputWithLabel label="CRMV da clínica" name="crmv" control={control} error={errors.crmv?.message} disabled={!canEdit} />
            <InputWithLabel label="Responsável técnico" name="responsible.name" control={control} error={errors.responsible?.name?.message} disabled={!canEdit} required />
            <InputWithLabel label="CRMV do responsável" name="responsible.crmv" control={control} error={errors.responsible?.crmv?.message} disabled={!canEdit} required />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
          <h2 className="mb-5 font-semibold text-slate-900 dark:text-white">Endereço</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <InputWithLabel label="CEP" name="address.zipCode" control={control} error={errors.address?.zipCode?.message} onChange={(event) => setValue('address.zipCode', formatCEP(event.target.value), { shouldValidate: true })} disabled={!canEdit} maxLength={9} required />
            <InputWithLabel label="Estado" name="address.state" control={control} error={errors.address?.state?.message} disabled={!canEdit} maxLength={2} required />
            <InputWithLabel label="Cidade" name="address.city" control={control} error={errors.address?.city?.message} disabled={!canEdit} required />
            <InputWithLabel label="Rua" name="address.street" control={control} error={errors.address?.street?.message} containerClassName="sm:col-span-2" disabled={!canEdit} required />
            <InputWithLabel label="Número" name="address.number" control={control} error={errors.address?.number?.message} disabled={!canEdit} required />
            <InputWithLabel label="Bairro" name="address.neighborhood" control={control} error={errors.address?.neighborhood?.message} disabled={!canEdit} required />
            <InputWithLabel label="Complemento" name="address.complement" control={control} disabled={!canEdit} />
          </div>
        </section>

        {canEdit && <div className="flex justify-end"><Button type="submit" loading={isSubmitting} className="bg-teal-600 text-white hover:bg-teal-700"><Save size={16} />Salvar alterações</Button></div>}
      </form>
    </main>
  );
}
