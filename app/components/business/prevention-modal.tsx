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
    <div className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl bg-white dark:bg-stone-900 shadow-2xl flex flex-col">
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 p-5 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-800/10 dark:bg-teal-500/10 border border-teal-800/40 dark:border-teal-500/40">
            <ShieldCheck
              size={20}
              className="text-teal-800 dark:text-teal-500"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Análise de Prevenção
            </h2>
            {studyTitle && (
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                {studyTitle}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="shrink-0 text-stone-500 dark:text-stone-400"
        >
          <X size={18} />
        </Button>
      </div>

      <div className="overflow-y-auto flex-1 p-5 space-y-6">
        {prevention.alteredValues.map((altered, idx) => (
          <div key={idx}>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-600 dark:text-red-500" />
              {altered.name}
            </h3>
            {altered.problems.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {altered.problems.map((problem, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-900 border border-red-600/30 dark:border-red-500/30 rounded-lg"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 dark:bg-red-500 text-white text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
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
                    className="flex items-start gap-2 p-2.5 bg-teal-800/10 dark:bg-teal-500/10 border border-teal-800/40 dark:border-teal-500/40 rounded-lg"
                  >
                    <CheckCircle2
                      size={15}
                      className="text-teal-800 dark:text-teal-500 shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
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
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <Lightbulb size={16} className="text-teal-800 dark:text-teal-500" />
                Recomendações Gerais
            </h3>
            <div className="space-y-2">
              {prevention.generalRecommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-teal-800/10 dark:bg-teal-500/10 border border-teal-800/40 dark:border-teal-500/40 rounded-lg"
                >
                  <CheckCircle2
                    size={16}
                    className="text-teal-800 dark:text-teal-500 shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
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
