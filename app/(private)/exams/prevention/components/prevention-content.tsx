'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Microscope,
  Scan,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/app/components/common/badge';
import { Card } from '@/app/components/common/card';
import { SectionCard } from '@/app/components/data/section-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { STUDY_TYPE_MAP } from '@/constants';
import { studiesService } from '@/services/studies.service';
import type { Study } from '@/types/study';

export function PreventionContent() {
  const params = useParams<{ slug: string }>();
  const id = params.slug;
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudy = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await studiesService.get(id);
      setStudy(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchStudy();
  }, [fetchStudy]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow space-y-3">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="text-center py-20">
        <Microscope
          size={48}
          className="text-stone-500/50 dark:text-stone-400/50 mx-auto mb-4"
        />
        <p className="text-stone-500 dark:text-stone-400">
          Exame não encontrado.
        </p>
        <Link href="/exams" className="mt-4 inline-block">
          <Button variant="outline">Voltar aos exames</Button>
        </Link>
      </div>
    );
  }

  const { prevention } = study;
  const isImaging = study.type === 'IMAGING';

  if (!prevention) {
    return (
      <div className="text-center py-20">
        <ShieldCheck
          size={48}
          className="text-stone-500/50 dark:text-stone-400/50 mx-auto mb-4"
        />
        <p className="text-stone-500 dark:text-stone-400">
          Nenhuma análise de prevenção disponível para este exame.
        </p>
        <Link
          href={`/exams/${study.id}`}
          className="mt-4 inline-block"
        >
          <Button variant="outline">Voltar ao exame</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/exams/${study.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck
              size={20}
              className="text-teal-800 dark:text-teal-500"
            />
            Análise de Prevenção
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {study.title ?? 'Exame'} — {study.patient?.name ?? '-'} ·{' '}
            {STUDY_TYPE_MAP[study.type].label}
          </p>
        </div>
      </div>

      {isImaging && study.imaging && (
        <SectionCard
          title="Contexto do exame"
          subtitle="Base de imagem utilizada para a análise preventiva"
          className="mb-4"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="neutral">
                <Scan size={12} /> {study.imaging.modality}
              </Badge>
              {study.imaging.bodyRegion && (
                <Badge color="neutral">{study.imaging.bodyRegion}</Badge>
              )}
            </div>
            {study.imaging.impression && (
              <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-100/60 p-3 dark:border-stone-800 dark:bg-stone-800/60">
                <Stethoscope
                  size={16}
                  className="mt-0.5 shrink-0 text-stone-500 dark:text-stone-400"
                />
                <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-100">
                  {study.imaging.impression}
                </p>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {prevention.generalDiagnosis && (
        <SectionCard
          title="Diagnóstico Geral"
          subtitle={
            isImaging
              ? 'Avaliação clínica consolidada com base nos achados alterados'
              : 'Avaliação clínica consolidada com base nos valores alterados'
          }
          className="mb-4"
        >
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900 border border-amber-600/40 dark:border-amber-400/40 rounded-lg mt-1">
            <ClipboardList size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">
              {prevention.generalDiagnosis}
            </p>
          </div>
        </SectionCard>
      )}

      {prevention.alteredValues.length > 0 && (
        <SectionCard
          title={isImaging ? 'Achados Alterados' : 'Valores Alterados'}
          subtitle={
            isImaging
              ? 'Implicações clínicas por estrutura avaliada'
              : 'Implicações clínicas por parâmetro'
          }
          className="mb-4"
        >
          <div className="space-y-4">
            {prevention.alteredValues.map((item, i) => {
              const isAttention = item.status === 'Atenção';
              return (
                <div
                  key={i}
                  className={`rounded-lg overflow-hidden border ${isAttention ? 'border-amber-600/30 dark:border-amber-400/30' : 'border-red-600/30 dark:border-red-500/30'}`}
                >
                  <div
                    className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${isAttention ? 'bg-amber-50 dark:bg-amber-900' : 'bg-red-50 dark:bg-red-900'}`}
                  >
                    <div
                      className={`flex gap-3 ${isImaging ? 'items-start' : 'items-center'} min-w-0`}
                    >
                      <AlertTriangle
                        size={16}
                        className={`shrink-0 ${isImaging ? 'mt-0.5' : ''} ${isAttention ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-500'}`}
                      />
                      {isImaging ? (
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                            {item.name}
                            {item.unit ? ` · ${item.unit}` : ''}
                          </p>
                          <p
                            className={`text-sm leading-relaxed ${isAttention ? 'text-amber-700 dark:text-amber-400' : 'text-red-600 dark:text-red-500'}`}
                          >
                            {item.value}
                          </p>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                            {item.name}
                          </span>
                          <span className="text-sm text-red-600 dark:text-red-500 font-medium">
                            {item.value}
                            {item.unit ? ` ${item.unit}` : ''}
                          </span>
                        </>
                      )}
                    </div>
                    <Badge color={isAttention ? 'yellow' : 'red'}>
                      {item.status}
                    </Badge>
                  </div>

                  {item.problems.length > 0 && (
                    <div className="px-4 pt-3 space-y-2">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isAttention ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-500'}`}
                      >
                        {isImaging ? 'Riscos clínicos' : 'Problemas'}
                      </p>
                      {item.problems.map((problem, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span
                            className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 mt-0.5 ${isAttention ? 'bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-400' : 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-500'}`}
                          >
                            {j + 1}
                          </span>
                          <p className="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">
                            {problem}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.recommendations?.length > 0 && (
                    <div className="px-4 pt-3 pb-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-500 mb-1">
                        {isImaging ? 'Conduta recomendada' : 'Recomendações'}
                      </p>
                      {item.recommendations.map((rec, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CheckCircle2
                            size={14}
                            className="text-teal-800 dark:text-teal-500 shrink-0 mt-0.5"
                          />
                          <p className="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {prevention.generalRecommendations?.length > 0 && (
        <SectionCard
          title="Recomendações Gerais"
          subtitle={
            isImaging
              ? 'Considerando todos os achados alterados em conjunto'
              : 'Considerando todos os valores alterados em conjunto'
          }
        >
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
                <p className="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {prevention.alteredValues.length === 0 &&
        !prevention.generalRecommendations?.length && (
        <Card className="p-8 text-center">
          <Lightbulb
            size={32}
            className="text-stone-500/50 dark:text-stone-400/50 mx-auto mb-2"
          />
          <p className="text-stone-500 dark:text-stone-400">
              Nenhuma recomendação disponível.
          </p>
        </Card>
      )}
    </>
  );
}
