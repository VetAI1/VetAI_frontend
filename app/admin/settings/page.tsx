'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { SectionCard } from '@/app/components/data/section-card';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Header } from '@/app/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/infra/auth-context';
import { hospitalSchema, type HospitalFormData } from '@/schemas/hospital';
import { hospitalsService } from '@/services/hospitals.service';
import { formatCEP, formatCNPJ, formatPhone, unmaskCEP, unmaskCNPJ } from '@/utils/masks';

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
          phone: formatPhone(hospital.phone ?? ''),
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
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Configurações da clínica" showStorage={false} />
        <SectionCard
          title="Identificação"
          subtitle="Dados usados para identificar sua clínica"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </SectionCard>
        <SectionCard
          title="Endereço"
          subtitle="Endereço completo da clínica"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <Header title="Configurações da clínica" showStorage={false} />

      <SectionCard
        title="Identificação"
        subtitle="Dados usados para identificar sua clínica"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InputWithLabel label="Nome da clínica" name="name" control={control} error={errors.name?.message} disabled={!canEdit} required />
          <InputWithLabel label="CNPJ" name="cnpj" control={control} error={errors.cnpj?.message} onChange={(event) => setValue('cnpj', formatCNPJ(event.target.value), { shouldValidate: true })} disabled={!canEdit} maxLength={18} required />
          <InputWithLabel label="Telefone da clínica" name="phone" control={control} error={errors.phone?.message} onChange={(event) => setValue('phone', formatPhone(event.target.value), { shouldValidate: true })} disabled={!canEdit} maxLength={15} required />
          <InputWithLabel label="Responsável técnico" name="responsible.name" control={control} error={errors.responsible?.name?.message} disabled={!canEdit} required />
          <InputWithLabel label="CRMV do responsável" name="responsible.crmv" control={control} error={errors.responsible?.crmv?.message} disabled={!canEdit} required />
        </div>
      </SectionCard>

      <SectionCard title="Endereço" subtitle="Endereço completo da clínica">
        <div className="grid gap-4 md:grid-cols-3">
          <InputWithLabel label="CEP" name="address.zipCode" control={control} error={errors.address?.zipCode?.message} onChange={(event) => setValue('address.zipCode', formatCEP(event.target.value), { shouldValidate: true })} disabled={!canEdit} maxLength={9} required />
          <InputWithLabel label="Estado" name="address.state" control={control} error={errors.address?.state?.message} disabled={!canEdit} maxLength={2} required />
          <InputWithLabel label="Cidade" name="address.city" control={control} error={errors.address?.city?.message} disabled={!canEdit} required />
          <InputWithLabel label="Rua" name="address.street" control={control} error={errors.address?.street?.message} containerClassName="md:col-span-2" disabled={!canEdit} required />
          <InputWithLabel label="Número" name="address.number" control={control} error={errors.address?.number?.message} disabled={!canEdit} required />
          <InputWithLabel label="Bairro" name="address.neighborhood" control={control} error={errors.address?.neighborhood?.message} disabled={!canEdit} required />
          <InputWithLabel label="Complemento" name="address.complement" control={control} disabled={!canEdit} />
        </div>
      </SectionCard>

      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90">
            <Save size={16} />Salvar alterações
          </Button>
        </div>
      )}
    </form>
  );
}
