import type {
  ImagingFindingStatus,
  StudyStatus,
  StudyType,
} from '@/types/study';

export const STUDY_STATUS_MAP: Record<
  StudyStatus,
  { label: string; color: 'green' | 'yellow' | 'red' | 'blue' }
> = {
  COMPLETED: { label: 'Concluído', color: 'green' },
  PROCESSING: { label: 'Processando', color: 'blue' },
  PENDING: { label: 'Pendente', color: 'yellow' },
  FAILED: { label: 'Falhou', color: 'red' },
};

export const STUDY_TYPE_MAP: Record<
  StudyType,
  { label: string; shortLabel: string; description: string }
> = {
  LABORATORY: {
    label: 'Exame laboratorial',
    shortLabel: 'Laboratorial',
    description: 'Hemograma, bioquímica, urinálise e afins',
  },
  IMAGING: {
    label: 'Exame de imagem',
    shortLabel: 'Imagem',
    description: 'Raio-x, ultrassom, tomografia e ressonância',
  },
};

export const IMAGING_STATUS_MAP: Record<
  ImagingFindingStatus,
  { label: string; color: 'green' | 'yellow' | 'red' }
> = {
  NORMAL: { label: 'Normal', color: 'green' },
  ATTENTION: { label: 'Atenção', color: 'yellow' },
  CRITICAL: { label: 'Crítico', color: 'red' },
};

export const STUDY_ACCEPTED_MIME_TYPES: Record<StudyType, string> = {
  LABORATORY: 'application/pdf',
  IMAGING: 'application/pdf,image/jpeg,image/png',
};
