import * as yup from 'yup';

export const catalogItemSchema = yup.object({
  name: yup.string().trim().required('Nome é obrigatório'),
  description: yup.string().optional(),
  price: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' ? undefined : value,
    )
    .positive('Valor deve ser maior que zero')
    .required('Preço é obrigatório'),
  category: yup
    .string()
    .oneOf([
      'PRODUCT',
      'SERVICE',
      'EXAM',
      'VACCINE',
      'PROCEDURE',
      'OTHER',
    ] as const)
    .required('Categoria é obrigatória'),
  active: yup.boolean().default(true),
});

export type CatalogItemFormData = yup.InferType<typeof catalogItemSchema>;
