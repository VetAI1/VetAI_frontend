'use client';

import { AlertCircle, Pill, Stethoscope, X } from 'lucide-react';

import { Badge } from '@/app/components/common/badge';
import { Button } from '@/components/ui/button';
import type { ConsultationDisease } from '@/types/consultation';

interface DiseaseDetailModalProps {
  disease: ConsultationDisease;
  generalTreatments: string[];
  onClose: () => void;
}

export function DiseaseDetailModal({
  disease,
  generalTreatments,
  onClose,
}: DiseaseDetailModalProps) {
  const treatments =
    disease.suggestedTreatments && disease.suggestedTreatments.length > 0
      ? disease.suggestedTreatments
      : generalTreatments;

  const severityLabels = {
    red: 'Urgente / Grave',
    yellow: 'Atenção / Moderado',
    green: 'Leve',
  };

  const severityBg = {
    red: 'bg-red-50 dark:bg-red-900 border-red-600/30 dark:border-red-500/30',
    yellow: 'bg-amber-50 dark:bg-amber-900 border-amber-600/30 dark:border-amber-400/30',
    green: 'bg-emerald-50 dark:bg-emerald-900 border-emerald-700/30 dark:border-emerald-500/30',
  };

  const probability =
    disease.probability <= 1
      ? Math.round(disease.probability * 100)
      : Math.round(disease.probability);

  return (
    <div className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl bg-white dark:bg-stone-900 shadow-2xl flex flex-col">
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-5 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${severityBg[disease.severity]}`}>
            <AlertCircle
              size={20}
              className={
                disease.severity === 'red'
                  ? 'text-red-600 dark:text-red-500'
                  : disease.severity === 'yellow'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-500'
              }
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {disease.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={disease.severity}>
                {severityLabels[disease.severity]}
              </Badge>
              <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                {probability}% probabilidade
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-stone-500 dark:text-stone-400"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="overflow-y-auto flex-1 p-5 space-y-5">
        <div>
          <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5">
            <span>Probabilidade</span>
            <span>{probability}%</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${
                disease.severity === 'red'
                  ? 'bg-red-600 dark:bg-red-500'
                  : disease.severity === 'yellow'
                    ? 'bg-amber-600 dark:bg-amber-400'
                    : 'bg-emerald-700 dark:bg-emerald-500'
              }`}
              style={{ width: `${probability}%` }}
            />
          </div>
        </div>

        {disease.reasoning && (
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2">
              <Stethoscope size={16} className="text-teal-800 dark:text-teal-500" />
                Raciocínio Clínico
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed bg-stone-100 dark:bg-stone-800 rounded-lg p-3">
              {disease.reasoning}
            </p>
          </div>
        )}

        {treatments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2">
              <Pill size={16} className="text-teal-800 dark:text-teal-500" />
                Tratamentos e Medicamentos Sugeridos
            </h3>
            <div className="space-y-2">
              {treatments.map((treatment, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 bg-teal-800/10 dark:bg-teal-500/10 border border-teal-800/40 dark:border-teal-500/40 rounded-lg"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {treatment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {treatments.length === 0 && (
          <div className="text-center py-4 text-stone-500 dark:text-stone-400">
            <Pill size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">
                Nenhum tratamento sugerido ainda para esta condição.
              <br />
                Continue a conversa para mais detalhes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
