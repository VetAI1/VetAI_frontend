'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { StudyPrevention } from '@/types/study';

interface PreventionModalProps {
  prevention: StudyPrevention;
  studyTitle?: string;
  onClose: () => void;
}

export function PreventionModal({
  prevention,
  studyTitle,
  onClose,
}: PreventionModalProps) {
  return (
    <div className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl bg-card shadow-2xl flex flex-col">
      <div className="bg-card border-b border-border p-5 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/40">
            <ShieldCheck
              size={20}
              className="text-primary"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
                Análise de Prevenção
            </h2>
            {studyTitle && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {studyTitle}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="shrink-0 text-muted-foreground"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="overflow-y-auto flex-1 p-5 space-y-6">
        {prevention.alteredValues.map((altered, idx) => (
          <div key={idx}>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle size={15} className="text-danger" />
              {altered.name}
            </h3>
            {altered.problems.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {altered.problems.map((problem, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 bg-danger-soft border border-danger/30 rounded-lg"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-danger text-white text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {problem}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {altered.recommendations.length > 0 && (
              <div className="space-y-1.5">
                {altered.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 bg-primary/10 border border-primary/40 rounded-lg"
                  >
                    <CheckCircle2
                      size={15}
                      className="text-primary shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {prevention.generalRecommendations.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Lightbulb size={16} className="text-primary" />
                Recomendações Gerais
            </h3>
            <div className="space-y-2">
              {prevention.generalRecommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/40 rounded-lg"
                >
                  <CheckCircle2
                    size={16}
                    className="text-primary shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
