import * as yup from 'yup';

export const chargeItemSchema = yup.object({
  name: yup.string().trim().required('Nome do item é obrigatório'),
  quantity: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .min(1, 'Quantidade mínima é 1')
    .required('Quantidade é obrigatória'),
  unit_price: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .min(0.01, 'Valor unitário deve ser maior que zero')
    .required('Valor é obrigatório'),
  catalog_item_id: yup.string().optional(),
});

export const paymentSchema = yup.object({
  tutor_id: yup.string().required('Tutor é obrigatório'),
  patient_id: yup.string().optional(),
  due_date: yup.string().required('Data de vencimento é obrigatória'),
  status: yup
    .string()
    .oneOf(['PENDING', 'PAID', 'CANCELLED'])
    .default('PENDING'),
  paid_at: yup.string().optional(),
  notes: yup.string().optional(),
  items: yup
    .array()
    .of(chargeItemSchema)
    .min(1, 'Adicione pelo menos um item à cobrança')
    .required('Itens são obrigatórios'),
});

export type PaymentFormData = yup.InferType<typeof paymentSchema>;
export type ChargeItemFormData = yup.InferType<typeof chargeItemSchema>;
