import * as yup from 'yup';

export const appointmentSchema = yup.object({
  title: yup.string().trim().required('Título é obrigatório'),
  date: yup.string().required('Data é obrigatória'),
  start_time: yup.string().required('Horário de início é obrigatório'),
  end_time: yup.string().optional(),
  type: yup
    .string()
    .oneOf(['CONSULTATION', 'VACCINATION', 'EXAM', 'SURGERY', 'OTHER'])
    .required('Tipo é obrigatório'),
  tutor_id: yup.string().required('Tutor é obrigatório'),
  patient_id: yup.string().optional(),
  description: yup.string().optional(),
});

export type AppointmentFormData = yup.InferType<typeof appointmentSchema>;
