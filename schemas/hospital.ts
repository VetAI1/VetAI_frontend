import * as yup from 'yup';

import { validateCEP, validateCNPJ } from '@/utils/validations';

export const hospitalSchema = yup.object({
  name: yup.string().required('Nome da clínica é obrigatório'),
  cnpj: yup
    .string()
    .test('cnpj-valid', 'CNPJ inválido', (value) =>
      Boolean(value && validateCNPJ(value)),
    )
    .required('CNPJ é obrigatório'),
  crmv: yup.string().default(''),
  address: yup.object({
    zipCode: yup
      .string()
      .test('cep-valid', 'CEP inválido', (value) =>
        Boolean(value && validateCEP(value)),
      )
      .required('CEP é obrigatório'),
    street: yup.string().required('Rua é obrigatória'),
    number: yup.string().required('Número é obrigatório'),
    complement: yup.string().optional(),
    neighborhood: yup.string().required('Bairro é obrigatório'),
    city: yup.string().required('Cidade é obrigatória'),
    state: yup.string().required('Estado é obrigatório'),
  }),
  responsible: yup.object({
    name: yup.string().required('Responsável é obrigatório'),
    crmv: yup.string().required('CRMV do responsável é obrigatório'),
  }),
});

export type HospitalFormData = yup.InferType<typeof hospitalSchema>;
