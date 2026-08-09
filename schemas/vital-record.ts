import * as yup from 'yup';

// Campos vêm de <input type="number">: string vazia vira undefined para cair
// na mensagem de obrigatório, não em "valor inválido".
const vitalField = yup
  .number()
  .transform((value: number, original: unknown) =>
    original === '' || original === null ? undefined : value,
  )
  .typeError('Valor inválido')
  .min(0, 'Valor inválido')
  .required('Campo obrigatório');

export const vitalRecordSchema = yup.object({
  heart_rate: vitalField,
  respiratory_rate: vitalField,
  rectal_temperature: vitalField,
  blood_pressure: vitalField,
  glucose: vitalField,
  capillary_refill_time: vitalField,
  notes: yup.string().optional(),
});

export type VitalRecordFormData = yup.InferType<typeof vitalRecordSchema>;
