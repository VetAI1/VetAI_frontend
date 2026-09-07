import { httpClient } from '@/infra/http-client';
import type { PaginatedResponse } from '@/types/common';
import type { Medicine, MedicineQueryParams } from '@/types/medicine';

function buildMedicineQuery(params?: MedicineQueryParams): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.size) sp.set('size', String(params.size));
  if (params.search) sp.set('search', params.search);
  // A API expõe o filtro de categoria como `classification` (MedicineQueryDto);
  // enviar `type` fazia o ValidationPipe (whitelist) descartar o parâmetro.
  if (params.type) sp.set('classification', params.type);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export const medicinesService = {
  list: (params?: MedicineQueryParams) =>
    httpClient<PaginatedResponse<Medicine>>(`medicines${buildMedicineQuery(params)}`),
};
