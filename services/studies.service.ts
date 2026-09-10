import { httpClient, buildQuery } from '@/infra/http-client';
import type { PaginatedResponse, QueryParams } from '@/types/common';
import type { Study, StudyType } from '@/types/study';

export const studiesService = {
  list: (params?: QueryParams & { patient_id?: string; type?: StudyType }) => {
    const base = buildQuery(params);
    const extra: string[] = [];
    if (params?.patient_id) extra.push(`patient_id=${params.patient_id}`);
    if (params?.type) extra.push(`type=${params.type}`);
    const extraParams = extra.length
      ? `${base ? '&' : '?'}${extra.join('&')}`
      : '';
    return httpClient<PaginatedResponse<Study>>(`study${base}${extraParams}`);
  },

  get: (id: string) => httpClient<Study>(`study/${id}`),

  upload: (
    patientId: string,
    files: File | File[],
    title: string,
    type: StudyType,
    examDate?: string,
  ) => {
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('title', title);
    formData.append('type', type);
    // Exames de imagem podem ter varias incidencias analisadas em conjunto.
    for (const file of Array.isArray(files) ? files : [files]) {
      formData.append('files', file);
    }
    if (examDate) formData.append('exam_date', examDate);
    return httpClient<Study>('study/upload', {
      method: 'POST',
      body: formData,
    });
  },

  generatePrevention: (id: string) =>
    httpClient<Study>(`study/${id}/prevention`, {
      method: 'POST',
    }),

  getFile: (id: string) =>
    httpClient<{ pdfBase64: string; mimeType: string }>(`study/${id}/pdf`),
};
