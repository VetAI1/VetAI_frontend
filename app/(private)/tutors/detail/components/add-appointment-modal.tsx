'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Modal } from '@/app/components/common/modal';
import { DateInput } from '@/app/components/forms/date-input';
import { FormTextarea } from '@/app/components/forms/form-textarea';
import { InputWithLabel } from '@/app/components/forms/input-with-label';
import { SelectInput } from '@/app/components/forms/select-input';
import { TimeInput } from '@/app/components/forms/time-input';
import { Button } from '@/components/ui/button';
import {
  appointmentSchema,
  type AppointmentFormData,
} from '@/schemas/appointment';
import { appointmentsService } from '@/services/appointments.service';
import {
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
  type AppointmentType,
} from '@/types/appointment';
import type { Patient } from '@/types/patient';

interface AddAppointmentModalProps {
  tutorId: string;
  pets: Patient[];
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
}

const TYPE_OPTIONS = (
  Object.keys(APPOINTMENT_TYPE_LABELS) as AppointmentType[]
).map((t) => ({
  value: t,
  label: APPOINTMENT_TYPE_LABELS[t],
}));

export function AddAppointmentModal({
  tutorId,
  pets,
  onClose,
  onSuccess,
}: AddAppointmentModalProps) {
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    resolver: yupResolver(appointmentSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      type: 'CONSULTATION',
      tutor_id: tutorId,
      patient_id: '',
    },
  });

  const petOptions = pets.map((p) => ({ value: p.id, label: p.name }));

  const onSubmit = async (data: AppointmentFormData) => {
    setGeneralError(null);
    try {
      const result = await appointmentsService.create({
        title: data.title.trim(),
        ...(data.description?.trim()
          ? { description: data.description.trim() }
          : {}),
        date: data.date,
        start_time: data.start_time,
        ...(data.end_time ? { end_time: data.end_time } : {}),
        type: data.type as AppointmentType,
        tutor_id: tutorId,
        ...(data.patient_id ? { patient_id: data.patient_id } : {}),
      });
      onSuccess(result);
    } catch {
      setGeneralError('Erro ao salvar. Tente novamente.');
    }
  };

  return (
    <Modal
      title="Novo Agendamento"
      description="Agende uma atividade para este tutor"
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <InputWithLabel
          label="Título"
          required
          placeholder="Ex: Consulta de rotina"
          error={errors.title?.message}
          control={control}
          name="title"
        />

        <div className="grid grid-cols-2 gap-3">
          <DateInput
            label="Data"
            value={watch('date') ?? ''}
            onChange={(v) => setValue('date', v, { shouldValidate: true })}
            required
            error={errors.date?.message}
          />
          <SelectInput
            label="Tipo"
            required
            control={control}
            name="type"
            options={TYPE_OPTIONS}
            error={errors.type?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TimeInput
            label="Horário início"
            required
            value={watch('start_time') ?? ''}
            onChange={(v) =>
              setValue('start_time', v, { shouldValidate: true })
            }
            error={errors.start_time?.message}
          />
          <TimeInput
            label="Horário fim"
            value={watch('end_time') ?? ''}
            onChange={(v) => setValue('end_time', v)}
            error={errors.end_time?.message}
          />
        </div>

        {petOptions.length > 0 && (
          <SelectInput
            label="Pet (opcional)"
            control={control}
            name="patient_id"
            options={petOptions}
            placeholder="Selecione um pet..."
            error={errors.patient_id?.message}
          />
        )}

        <FormTextarea
          label="Descrição"
          placeholder="Observações..."
          rows={2}
          control={control}
          name="description"
          error={errors.description?.message}
        />

        {generalError && <p className="text-sm text-red-600 dark:text-red-500">{generalError}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              'Agendar'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
