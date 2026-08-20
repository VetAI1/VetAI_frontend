import { buildQuery, httpClient } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { ScheduleEvent } from '@/types/schedule';

type ScheduleEventPayload = Omit<ScheduleEvent, 'id'>;

export interface ScheduleListParams extends QueryParams {
  patient_name?: string;
  tutor_name?: string;
  date?: string;
  from?: string;
  to?: string;
}

function buildScheduleQuery(params?: ScheduleListParams): string {
  const base = buildQuery(params);
  if (!params) return base;

  const extra = new URLSearchParams();
  if (params.patient_name) extra.set('patient_name', params.patient_name);
  if (params.tutor_name) extra.set('tutor_name', params.tutor_name);
  if (params.date) extra.set('date', params.date);
  if (params.from) extra.set('from', params.from);
  if (params.to) extra.set('to', params.to);

  const extraQuery = extra.toString();
  if (!extraQuery) return base;
  return base ? `${base}&${extraQuery}` : `?${extraQuery}`;
}

export const scheduleService = {
  async list(params?: ScheduleListParams): Promise<ScheduleEvent[]> {
    const response = await httpClient<PaginatedResponse<ScheduleEvent>>(
      `schedule/events${buildScheduleQuery(params)}`,
    );
    return response.data;
  },

  async listByDate(date: string): Promise<ScheduleEvent[]> {
    return this.list({ date, size: 500, sort: 'startTime', direction: 'asc' });
  },

  async listByPatient(
    patient_name: string,
    fromDate?: string,
  ): Promise<ScheduleEvent[]> {
    const params: ScheduleListParams = {
      patient_name,
      size: 500,
      sort: 'date',
      direction: 'asc',
    };
    if (fromDate) {
      params.date = fromDate;
    }
    return this.list(params);
  },

  get(id: string) {
    return httpClient<ScheduleEvent>(`schedule/events/${id}`);
  },

  create(data: ScheduleEventPayload) {
    return httpClient<ScheduleEvent>('schedule/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<ScheduleEventPayload>) {
    return httpClient<ScheduleEvent>(`schedule/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return httpClient<void>(`schedule/events/${id}`, { method: 'DELETE' });
  },
};
