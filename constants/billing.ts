import type { AiUsageOperation } from '@/types/billing';

export const AI_OPERATION_LABELS: Record<AiUsageOperation, string> = {
  consultation: 'Consulta com IA',
  study_analysis: 'Análise de exame',
  study_prevention: 'Plano de prevenção',
};
