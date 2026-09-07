'use client';

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Microscope,
  Scan,
  ShieldCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { formatReference } from '../utils';
import { ImagingReportView } from './imaging-report';

import { Badge } from '@/app/components/common/badge';
import { Card } from '@/app/components/common/card';
import { SectionCard } from '@/app/components/data/section-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { STUDY_STATUS_MAP, STUDY_TYPE_MAP } from '@/constants';
import { studiesService } from '@/services/studies.service';
import type { AlteredValueInfo, Study } from '@/types/study';

const STATUS_MAP = STUDY_STATUS_MAP;

export function ExamDetailContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const id = params.slug;
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState<AlteredValueInfo | null>(
    null,
  );
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string>('application/pdf');
  const [loadingFile, setLoadingFile] = useState(false);

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

  const isImaging = study?.type === 'IMAGING';

  const hasAlteredValues = isImaging
    ? (study?.imaging?.findings.some((f) => f.status !== 'NORMAL') ?? false)
    : (study?.results.some((r) =>
      r.values.some((v) => v.status === 'HIGHER' || v.status === 'LOWER'),
    ) ?? false);

  const openFile = async () => {
    if (!id) return;
    setLoadingFile(true);
    try {
      const { pdfBase64, mimeType } = await studiesService.getFile(id);
      const binary = atob(pdfBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mimeType });
      setFileMimeType(mimeType);
      setFileUrl(URL.createObjectURL(blob));
    } catch {
      // silently fail
    } finally {
      setLoadingFile(false);
    }
  };

  const closeFile = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-stone-200/70 dark:border-stone-800/70">
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

  if (isWaiting) {
    const message =
      study.status === 'PENDING' || study.status === 'PROCESSING'
        ? 'Exame em processamento, aguarde alguns instantes.'
        : 'Análise de prevenção em andamento, aguarde alguns instantes.';
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={36} className="animate-spin text-teal-800 dark:text-teal-500" />
        <p className="text-stone-500 dark:text-stone-400 text-sm">{message}</p>
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
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
              {study.title ?? 'Exame'}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
              Paciente: {study.patient?.name ?? '-'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:ml-auto sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={() => {
              void openFile();
            }}
            disabled={loadingFile}
            className="gap-2 text-sm"
          >
            {loadingFile ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isImaging ? (
              <ImageIcon size={16} />
            ) : (
              <FileText size={16} />
            )}
            Visualizar exame
          </Button>
          {study.status === 'COMPLETED' && hasAlteredValues && (
            <Button
              onClick={() => router.push(`/exams/${study.id}/prevention`)}
              className="bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90 gap-2 text-sm"
            >
              <ShieldCheck size={16} />
              Prevenção
            </Button>
          )}
          <Badge color="neutral">{STUDY_TYPE_MAP[study.type].shortLabel}</Badge>
          <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
      </div>

      {isImaging ? (
        study.imaging ? (
          <ImagingReportView
            imaging={study.imaging}
            alteredValues={study.prevention?.alteredValues}
            onSelectFinding={setSelectedValue}
          />
        ) : (
          <Card className="p-8 text-center">
            <Scan
              size={32}
              className="text-stone-500/50 dark:text-stone-400/50 mx-auto mb-2"
            />
            <p className="text-stone-500 dark:text-stone-400">
              {study.status === 'PENDING' || study.status === 'PROCESSING'
                ? 'O exame de imagem está sendo analisado. O laudo aparecerá aqui em breve.'
                : 'Nenhum laudo disponível para este exame de imagem.'}
            </p>
          </Card>
        )
      ) : study.results.length > 0 ? (
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
                        ? 'border-red-600/30 dark:border-red-500/30 bg-red-50 dark:bg-red-900'
                        : isNA
                          ? 'opacity-60'
                          : ''
                    } ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
                  >
                    {isQualitative ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`font-medium text-sm ${isAltered ? 'text-red-600 dark:text-red-500' : 'text-stone-900 dark:text-stone-100'}`}
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
                          className={`text-sm ${isAltered ? 'text-red-600 dark:text-red-500' : 'text-stone-500 dark:text-stone-400'}`}
                        >
                          {val.value}
                        </p>
                        {referenceText && (
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            Referência: {referenceText}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-medium text-sm truncate ${isAltered ? 'text-red-600 dark:text-red-500' : 'text-stone-900 dark:text-stone-100'}`}
                          >
                            {val.title}
                          </p>
                          {val.unit && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              Unidade: {val.unit}
                            </p>
                          )}
                          {referenceText && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              Referência: {referenceText}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={`text-lg font-bold ${isAltered ? 'text-red-600 dark:text-red-500' : isNA ? 'text-stone-500/70 dark:text-stone-400/70' : 'text-stone-900 dark:text-stone-100'}`}
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
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-2 px-1">
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
            className="text-stone-500/50 dark:text-stone-400/50 mx-auto mb-2"
          />
          <p className="text-stone-500 dark:text-stone-400">
            {study.status === 'PENDING' || study.status === 'PROCESSING'
              ? 'O exame está sendo processado. Os resultados aparecerão aqui em breve.'
              : 'Nenhum resultado disponível para este exame.'}
          </p>
        </Card>
      )}

      {fileUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeFile}
          />
          <div className="relative flex flex-col bg-white dark:bg-stone-900 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200 dark:border-stone-800 shrink-0">
              <p className="font-semibold text-sm text-stone-900 dark:text-stone-100 truncate">
                {study.title ?? 'Exame'}
              </p>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={closeFile}
                className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 shrink-0"
              >
                <X size={18} />
              </Button>
            </div>
            {fileMimeType.startsWith('image/') ? (
              <div className="flex-1 overflow-auto rounded-b-xl bg-stone-100 p-4 dark:bg-stone-950">
                <img
                  src={fileUrl}
                  alt={`Imagem do exame ${study.title ?? ''}`.trim()}
                  className="mx-auto h-auto max-w-full object-contain"
                />
              </div>
            ) : (
              <iframe
                src={fileUrl}
                className="flex-1 w-full border-0 rounded-b-xl"
                title="Visualizar exame"
              />
            )}
          </div>
        </div>
      )}

      {selectedValue && (() => {
        const isAttention = selectedValue.status === 'Atenção';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedValue(null)}
            />
            <div className="relative bg-white dark:bg-stone-900 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-5 py-4 flex items-start justify-between gap-3 z-10">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <AlertTriangle
                      size={16}
                      className={`shrink-0 ${isAttention ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-500'}`}
                    />
                    <h3 className="font-bold text-stone-900 dark:text-stone-100">
                      {selectedValue.name}
                    </h3>
                    <Badge color={isAttention ? 'yellow' : 'red'}>
                      {selectedValue.status}
                    </Badge>
                  </div>
                  <p
                    className={`text-sm font-medium ${isAttention ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-500'}`}
                  >
                    {selectedValue.value}
                    {selectedValue.unit ? ` ${selectedValue.unit}` : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedValue(null)}
                  className="text-stone-500 dark:text-stone-400 shrink-0"
                >
                  <X size={18} />
                </Button>
              </div>

              <div className="p-5 space-y-4">
                {selectedValue.problems.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-500 mb-2">
                    Problemas
                    </p>
                    <div className="space-y-2">
                      {selectedValue.problems.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-900 border border-red-600/30 dark:border-red-500/30 rounded-lg"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600 dark:bg-red-500 text-white text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">
                            {p}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedValue.recommendations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-500 mb-2">
                    Recomendações
                    </p>
                    <div className="space-y-2">
                      {selectedValue.recommendations.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2.5 bg-teal-800/10 dark:bg-teal-500/10 border border-teal-800/40 dark:border-teal-500/40 rounded-lg"
                        >
                          <CheckCircle2
                            size={15}
                            className="text-teal-800 dark:text-teal-500 shrink-0 mt-0.5"
                          />
                          <p className="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">
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
        );
      })()}
    </>
  );
}
