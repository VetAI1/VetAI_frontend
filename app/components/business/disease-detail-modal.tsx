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
    red: 'bg-danger-soft border-danger/30',
    yellow: 'bg-warning-soft border-warning/30',
    green: 'bg-success-soft border-success/30',
  };

  const probability =
    disease.probability <= 1
      ? Math.round(disease.probability * 100)
      : Math.round(disease.probability);

  return (
    <div className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl bg-card shadow-2xl flex flex-col">
      <div className="bg-card border-b border-border p-5 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${severityBg[disease.severity]}`}>
            <AlertCircle
              size={20}
              className={
                disease.severity === 'red'
                  ? 'text-danger'
                  : disease.severity === 'yellow'
                    ? 'text-warning'
                    : 'text-success'
              }
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {disease.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={disease.severity}>
                {severityLabels[disease.severity]}
              </Badge>
              <span className="text-sm font-semibold text-muted-foreground">
                {probability}% probabilidade
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-muted-foreground"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="overflow-y-auto flex-1 p-5 space-y-5">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Probabilidade</span>
            <span>{probability}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${
                disease.severity === 'red'
                  ? 'bg-danger'
                  : disease.severity === 'yellow'
                    ? 'bg-warning'
                    : 'bg-success'
              }`}
              style={{ width: `${probability}%` }}
            />
          </div>
        </div>

        {disease.reasoning && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Stethoscope size={16} className="text-primary" />
                Raciocínio Clínico
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted rounded-lg p-3">
              {disease.reasoning}
            </p>
          </div>
        )}

        {treatments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Pill size={16} className="text-primary" />
                Tratamentos e Medicamentos Sugeridos
            </h3>
            <div className="space-y-2">
              {treatments.map((treatment, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/40 rounded-lg"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {treatment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {treatments.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
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
