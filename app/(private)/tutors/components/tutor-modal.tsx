'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';

import { notifyMutationSuccess } from '@/app/components/common/mutation-feedback';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { Button } from '@/components/ui/button';
import { tutorSchema, type TutorFormData } from '@/schemas/tutor';
import { tutorsService } from '@/services/tutors.service';
import type {
  CreateTutorPayload,
  Tutor,
  UpdateTutorPayload,
} from '@/types/tutor';
import { formatCPF, formatPhone } from '@/utils/validations';

interface TutorModalProps {
  tutor?: Tutor;
  onClose: () => void;
  onSuccess: (tutor: Tutor) => void;
}

export function TutorModal({ tutor, onClose, onSuccess }: TutorModalProps) {
  const isEdit = !!tutor;
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TutorFormData>({
    resolver: yupResolver(tutorSchema) as unknown as Resolver<TutorFormData>,
    defaultValues: {
      name: tutor?.name ?? '',
      cpf: tutor?.cpf ?? '',
      phone: formatPhone(tutor?.phone ?? ''),
      email: tutor?.email ?? '',
      address: tutor?.address ?? '',
    },
  });

  const onSubmit = async (data: TutorFormData) => {
    setSaving(true);

    try {
      let result: Tutor;
      if (isEdit) {
        const payload = {
          name: data.name.trim(),
          cpf: data.cpf.trim(),
        } as UpdateTutorPayload;
        if (data.phone?.trim()) payload.phone = data.phone.trim();
        if (data.email?.trim()) payload.email = data.email.trim();
        if (data.address?.trim()) payload.address = data.address.trim();
        result = await tutorsService.update(tutor.id, payload);
      } else {
        const payload = {
          name: data.name.trim(),
          cpf: data.cpf.trim(),
        } as CreateTutorPayload;
        if (data.phone?.trim()) payload.phone = data.phone.trim();
        if (data.email?.trim()) payload.email = data.email.trim();
        if (data.address?.trim()) payload.address = data.address.trim();
        result = await tutorsService.create(payload);
      }
      notifyMutationSuccess(
        isEdit ? 'Tutor atualizado com sucesso.' : 'Tutor cadastrado com sucesso.',
      );
      onSuccess(result);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-xl bg-card shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-border p-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {isEdit ? 'Editar Tutor' : 'Novo Tutor'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? 'Atualize os dados do tutor' : 'Cadastre um novo tutor'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-muted-foreground"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="min-h-0 overflow-y-auto p-5 space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Nome"
              required
              type="text"
              value={field.value}
              onChange={field.onChange}
              placeholder="Ex: João Silva"
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          name="cpf"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="CPF"
              required
              type="text"
              value={field.value}
              onChange={(e) => field.onChange(formatCPF(e.target.value))}
              placeholder="Ex: 123.456.789-09"
              error={errors.cpf?.message}
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="Telefone"
              required
              type="tel"
              inputMode="numeric"
              maxLength={15}
              value={field.value}
              onChange={(e) => field.onChange(formatPhone(e.target.value))}
              placeholder="Ex: (11) 99999-9999"
              error={errors.phone?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label="E-mail"
              required
              type="email"
              value={field.value}
              onChange={field.onChange}
              placeholder="Ex: joao@email.com"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          name='address'
          control={control}
          render={({ field }) => (
            <InputWithLabel
              label='Endereço'
              type='text'
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder='Ex: Rua das Flores, 123 - São Paulo/SP'
              error={errors.address?.message}
            />
          )}
        />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-5 py-4">
        <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          loading={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
        >
          {isEdit ? 'Salvar' : 'Cadastrar'}
        </Button>
      </div>
    </div>
  );
}
