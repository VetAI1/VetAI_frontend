'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Microscope,
  ShieldCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { formatReference } from '../utils';

import { Badge } from '@/app/components/common/badge';
import { Card } from '@/app/components/common/card';
import { SectionCard } from '@/app/components/data/section-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { STUDY_STATUS_MAP } from '@/constants';
import { studiesService } from '@/services/studies.service';
import type { AlteredValueInfo, Study } from '@/types/study';

const STATUS_MAP = STUDY_STATUS_MAP;

export function ExamDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState<AlteredValueInfo | null>(
    null,
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

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

  const isWaiting =
    study?.status === 'PENDING' ||
    study?.status === 'PROCESSING' ||
    study?.preventionStatus === 'GENERATING';

  useEffect(() => {
    if (study?.status !== 'PROCESSING') return;
    const interval = setInterval(async () => {
      try {
        const data = await studiesService.get(study.id);
        setStudy(data);
        if (data.status !== 'PROCESSING') clearInterval(interval);
      } catch {
        clearInterval(interval);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [study?.id, study?.status]);

  const hasAlteredValues =
    study?.results.some((r) =>
      r.values.some((v) => v.status === 'HIGHER' || v.status === 'LOWER'),
    ) ?? false;

  const openPdf = async () => {
    if (!id) return;
    setLoadingPdf(true);
    try {
      const { pdfBase64 } = await studiesService.getPdf(id);
      const binary = atob(pdfBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch {
      // silently fail
    } finally {
      setLoadingPdf(false);
    }
  };

  const closePdf = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/70">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
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

  if (isWaiting) {
    const message =
      study.status === 'PENDING' || study.status === 'PROCESSING'
        ? 'Exame em processamento, aguarde alguns instantes.'
        : 'Análise de prevenção em andamento, aguarde alguns instantes.';
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[study.status] ?? {
    label: study.status,
    color: 'yellow' as const,
  };

  return (
    <>
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/exams">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">
              {study.title ?? 'Exame'}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              Paciente: {study.patient?.name ?? '-'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:ml-auto sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={() => {
              void openPdf();
            }}
            disabled={loadingPdf}
            className="gap-2 text-sm"
          >
            {loadingPdf ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            Visualizar exame
          </Button>
          {study.status === 'COMPLETED' && hasAlteredValues && (
            <Button
              onClick={() => router.push(`/exams/prevention?id=${study.id}`)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm"
            >
              <ShieldCheck size={16} />
              Prevenção
            </Button>
          )}
          <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
      </div>

      {study.results.length > 0 ? (
        study.results
          .filter(
            (result) =>
              !/^(comentários|observações|obs\.?|notas|laudo)$/i.test(
                result.title.trim(),
              ),
          )
          .map((result, i) => {
            const { prevention } = study;
            const hasSubgroups = result.values.some((v) => v.subgroup);
            const subgroups = hasSubgroups
              ? ([
                ...new Set(
                  result.values.map((v) => v.subgroup).filter(Boolean),
                ),
              ] as string[])
              : [];

            const renderValues = (values: typeof result.values) =>
              values.map((val, j) => {
                const isNA = val.value === 'N/A';
                const isAltered =
                  !isNA && (val.status === 'HIGHER' || val.status === 'LOWER');
                const referenceText = formatReference(val);
                const alteredInfo = isAltered
                  ? prevention?.alteredValues.find((a) => a.name === val.title)
                  : undefined;
                const isClickable = !!alteredInfo;
                const isQualitative = !isNA && isNaN(Number(val.value));

                return (
                  <Card
                    key={j}
                    {...(isClickable
                      ? { onClick: () => setSelectedValue(alteredInfo) }
                      : {})}
                    className={`p-4 transition-colors ${
                      isAltered
                        ? 'border-danger/30 bg-danger-soft'
                        : isNA
                          ? 'opacity-60'
                          : ''
                    } ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
                  >
                    {isQualitative ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`font-medium text-sm ${isAltered ? 'text-danger' : 'text-foreground'}`}
                          >
                            {val.title}
                          </p>
                          {!isNA && (
                            <Badge color={isAltered ? 'red' : 'green'}>
                              {val.status === 'HIGHER' ? 'Alterado' : 'Normal'}
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`text-sm ${isAltered ? 'text-danger' : 'text-muted-foreground'}`}
                        >
                          {val.value}
                        </p>
                        {referenceText && (
                          <p className="text-xs text-muted-foreground">
                            Referência: {referenceText}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-medium text-sm truncate ${isAltered ? 'text-danger' : 'text-foreground'}`}
                          >
                            {val.title}
                          </p>
                          {val.unit && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Unidade: {val.unit}
                            </p>
                          )}
                          {referenceText && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Referência: {referenceText}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={`text-lg font-bold ${isAltered ? 'text-danger' : isNA ? 'text-muted-foreground/70' : 'text-foreground'}`}
                          >
                            {val.value}
                          </p>
                          {!isNA && (
                            <Badge color={isAltered ? 'red' : 'green'}>
                              {val.status === 'HIGHER'
                                ? 'Alto'
                                : val.status === 'LOWER'
                                  ? 'Baixo'
                                  : 'Normal'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              });

            const renderMixed = (values: typeof result.values) => {
              const qualitative = values.filter(
                (v) => v.value !== 'N/A' && isNaN(Number(v.value)),
              );
              const numeric = values.filter((v) => !qualitative.includes(v));
              return (
                <div className="flex flex-col gap-3">
                  {numeric.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {renderValues(numeric)}
                    </div>
                  )}
                  {qualitative.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {renderValues(qualitative)}
                    </div>
                  )}
                </div>
              );
            };

            return (
              <SectionCard
                key={i}
                title={result.title}
                subtitle="Resultados do exame"
                className="mb-4"
              >
                {hasSubgroups ? (
                  <div className="space-y-4">
                    {subgroups.map((sg) => (
                      <div key={sg}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">
                          {sg}
                        </p>
                        {renderMixed(
                          result.values.filter((v) => v.subgroup === sg),
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  renderMixed(result.values)
                )}
              </SectionCard>
            );
          })
      ) : (
        <Card className="p-8 text-center">
          <Microscope
            size={32}
            className="text-muted-foreground/50 mx-auto mb-2"
          />
          <p className="text-muted-foreground">
            {study.status === 'PENDING' || study.status === 'PROCESSING'
              ? 'O exame está sendo processado. Os resultados aparecerão aqui em breve.'
              : 'Nenhum resultado disponível para este exame.'}
          </p>
        </Card>
      )}

      {pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closePdf}
          />
          <div className="relative flex flex-col bg-card rounded-xl shadow-2xl w-full max-w-4xl h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {study.title ?? 'Exame'}
              </p>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={closePdf}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X size={18} />
              </Button>
            </div>
            <iframe
              src={pdfUrl}
              className="flex-1 w-full border-0 rounded-b-xl"
              title="Visualizar exame"
            />
          </div>
        </div>
      )}

      {selectedValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedValue(null)}
          />
          <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-start justify-between gap-3 z-10">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <AlertTriangle size={16} className="text-danger shrink-0" />
                  <h3 className="font-bold text-foreground">
                    {selectedValue.name}
                  </h3>
                  <Badge color="red">{selectedValue.status}</Badge>
                </div>
                <p className="text-sm text-danger font-medium">
                  {selectedValue.value}
                  {selectedValue.unit ? ` ${selectedValue.unit}` : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSelectedValue(null)}
                className="text-muted-foreground shrink-0"
              >
                <X size={18} />
              </Button>
            </div>

            <div className="p-5 space-y-4">
              {selectedValue.problems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-danger mb-2">
                    Problemas
                  </p>
                  <div className="space-y-2">
                    {selectedValue.problems.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 bg-danger-soft border border-danger/30 rounded-lg"
                      >
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-danger text-white text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-secondary-foreground leading-relaxed">
                          {p}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedValue.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                    Recomendações
                  </p>
                  <div className="space-y-2">
                    {selectedValue.recommendations.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 bg-primary/10 border border-primary/40 rounded-lg"
                      >
                        <CheckCircle2
                          size={15}
                          className="text-primary shrink-0 mt-0.5"
                        />
                        <p className="text-sm text-secondary-foreground leading-relaxed">
                          {r}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
