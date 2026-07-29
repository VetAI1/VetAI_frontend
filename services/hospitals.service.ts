import { httpClient } from '@/infra/http-client';
import type { Hospital, UpdateHospitalPayload } from '@/types/settings';

export const hospitalsService = {
  get: () => httpClient<Hospital>('hospital'),
  update: (data: UpdateHospitalPayload) =>
    httpClient<Hospital>('hospital', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
