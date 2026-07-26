import { getToken, httpClient, refreshAccessToken } from '@/infra/http-client';
import type { PatientDocument } from '@/types/health-record';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const documentsService = {
  list: (patientId: string) =>
    httpClient<PatientDocument[]>(`patients/${patientId}/documents`),

  upload: (patientId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient<PatientDocument>(`patients/${patientId}/documents`, {
      method: 'POST',
      body: formData,
    });
  },

  download: async (
    patientId: string,
    documentId: string,
  ): Promise<{ url: string; mimeType: string }> => {
    const download = () =>
      fetch(
        `${API_BASE_URL}/patients/${patientId}/documents/${documentId}/download`,
        {
          credentials: 'include',
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
        },
      );
    let response = await download();
    if (response.status === 401) {
      await refreshAccessToken();
      response = await download();
    }
    if (!response.ok) throw new Error('Falha ao baixar documento');
    const mimeType =
      response.headers.get('content-type') ?? 'application/octet-stream';
    const blob = await response.blob();
    return { url: URL.createObjectURL(blob), mimeType };
  },

  delete: (patientId: string, documentId: string) =>
    httpClient<void>(`patients/${patientId}/documents/${documentId}`, {
      method: 'DELETE',
    }),
};
