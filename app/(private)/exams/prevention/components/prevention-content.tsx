'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Microscope,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/app/components/common/badge';
import { Card } from '@/app/components/common/card';
import { SectionCard } from '@/app/components/data/section-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { studiesService } from '@/services/studies.service';
import type { Study } from '@/types/study';

export function PreventionContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
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
        <div className="rounded-xl border border-border bg-card p-6 shadow space-y-3">
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
          className="text-muted-foreground/50 mx-auto mb-4"
        />
        <p className="text-muted-foreground">
          Exame não encontrado.
        </p>
        <Link href="/exams" className="mt-4 inline-block">
          <Button variant="outline">Voltar aos exames</Button>
        </Link>
      </div>
    );
  }

  const { prevention } = study;

  if (!prevention) {
    return (
      <div className="text-center py-20">
        <ShieldCheck
          size={48}
          className="text-muted-foreground/50 mx-auto mb-4"
        />
        <p className="text-muted-foreground">
          Nenhuma análise de prevenção disponível para este exame.
        </p>
        <Link
          href={`/exams/detail?id=${study.id}`}
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
        <Link href={`/exams/detail?id=${study.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck
              size={20}
              className="text-primary"
            />
            Análise de Prevenção
          </h2>
          <p className="text-sm text-muted-foreground">
            {study.title ?? 'Exame'} — {study.patient?.name ?? '-'}
          </p>
        </div>
      </div>

      {prevention.generalDiagnosis && (
        <SectionCard
          title="Diagnóstico Geral"
          subtitle="Avaliação clínica consolidada com base nos valores alterados"
          className="mb-4"
        >
          <div className="flex items-start gap-3 p-4 bg-warning-soft border border-warning/40 rounded-lg mt-1">
            <ClipboardList size={18} className="text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-secondary-foreground leading-relaxed">
              {prevention.generalDiagnosis}
            </p>
          </div>
        </SectionCard>
      )}

      {prevention.alteredValues.length > 0 && (
        <SectionCard
          title="Valores Alterados"
          subtitle="Implicações clínicas por parâmetro"
          className="mb-4"
        >
          <div className="space-y-4">
            {prevention.alteredValues.map((item, i) => (
              <div
                key={i}
                className="border border-danger/30 rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-danger-soft">
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      size={16}
                      className="text-danger shrink-0"
                    />
                    <span className="font-semibold text-sm text-foreground">
                      {item.name}
                    </span>
                    <span className="text-sm text-danger font-medium">
                      {item.value}
                      {item.unit ? ` ${item.unit}` : ''}
                    </span>
                  </div>
                  <Badge color="red">
                    {item.status === 'Alto' ? 'Alto' : 'Baixo'}
                  </Badge>
                </div>

                {item.problems.length > 0 && (
                  <div className="px-4 pt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-danger mb-1">
                      Problemas
                    </p>
                    {item.problems.map((problem, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-danger-soft text-danger text-xs font-bold shrink-0 mt-0.5">
                          {j + 1}
                        </span>
                        <p className="text-sm text-secondary-foreground leading-relaxed">
                          {problem}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {item.recommendations?.length > 0 && (
                  <div className="px-4 pt-3 pb-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                      Recomendações
                    </p>
                    {item.recommendations.map((rec, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="text-primary shrink-0 mt-0.5"
                        />
                        <p className="text-sm text-secondary-foreground leading-relaxed">
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {prevention.generalRecommendations?.length > 0 && (
        <SectionCard
          title="Recomendações Gerais"
          subtitle="Considerando todos os valores alterados em conjunto"
        >
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
                <p className="text-sm text-secondary-foreground leading-relaxed">
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
            className="text-muted-foreground/50 mx-auto mb-2"
          />
          <p className="text-muted-foreground">
              Nenhuma recomendação disponível.
          </p>
        </Card>
      )}
    </>
  );
}
