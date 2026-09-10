import { getToken, httpClient, refreshAccessToken } from '@/infra/http-client';
import type { GalleryItem } from '@/types/health-record';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const galleryService = {
  // Traz documentos do paciente e anexos das analises de exame numa lista so.
  list: (patientId: string) =>
    httpClient<GalleryItem[]>(`patients/${patientId}/gallery`),

  download: async (
    patientId: string,
    fileId: string,
  ): Promise<{ url: string; mimeType: string }> => {
    const request = () =>
      fetch(`${API_BASE_URL}/patients/${patientId}/gallery/${fileId}/download`, {
        credentials: 'include',
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      });

    let response = await request();
    if (response.status === 401) {
      await refreshAccessToken();
      response = await request();
    }
    if (!response.ok) throw new Error('Falha ao baixar arquivo');

    const mimeType =
      response.headers.get('content-type') ?? 'application/octet-stream';
    const blob = await response.blob();
    return { url: URL.createObjectURL(blob), mimeType };
  },
};
