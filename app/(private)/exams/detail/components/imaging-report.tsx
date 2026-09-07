'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Layers,
  Scan,
  Stethoscope,
} from 'lucide-react';

import { Badge } from '@/app/components/common/badge';
import { Card } from '@/app/components/common/card';
import { SectionCard } from '@/app/components/data/section-card';
import { IMAGING_STATUS_MAP } from '@/constants';
import type { AlteredValueInfo, ImagingReport } from '@/types/study';

interface ImagingReportViewProps {
  imaging: ImagingReport;
  /** Prevention entries keyed by finding region, when the analysis is ready. */
  alteredValues?: AlteredValueInfo[] | undefined;
  onSelectFinding?: (info: AlteredValueInfo) => void;
}

export function ImagingReportView({
  imaging,
  alteredValues,
  onSelectFinding,
}: ImagingReportViewProps) {
  const findings = imaging.findings ?? [];
  const altered = findings.filter((f) => f.status !== 'NORMAL');
  const normal = findings.filter((f) => f.status === 'NORMAL');

  const renderFinding = (
    finding: ImagingReport['findings'][number],
    key: number,
  ) => {
    const statusInfo = IMAGING_STATUS_MAP[finding.status] ?? {
      label: finding.status,
      color: 'yellow' as const,
    };
    const isAltered = finding.status !== 'NORMAL';
    const isCritical = finding.status === 'CRITICAL';
    const preventionInfo = isAltered
      ? alteredValues?.find((a) => a.name === finding.region)
      : undefined;
    const isClickable = Boolean(preventionInfo && onSelectFinding);

    return (
      <Card
        key={key}
        {...(isClickable && preventionInfo
          ? { onClick: () => onSelectFinding?.(preventionInfo) }
          : {})}
        className={`p-4 transition-colors ${
          isCritical
            ? 'border-red-600/30 dark:border-red-500/30 bg-red-50 dark:bg-red-900'
            : isAltered
              ? 'border-amber-600/30 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-900'
              : ''
        } ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`font-medium text-sm ${
                isCritical
                  ? 'text-red-600 dark:text-red-500'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {finding.region}
            </p>
            <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
          <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            {finding.description}
          </p>
          {finding.measurement && (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Medida: {finding.measurement}
            </p>
          )}
        </div>
      </Card>
    );
  };

  return (
    <>
      <SectionCard
        title="Dados do exame"
        subtitle="Modalidade, região e técnica utilizada"
        className="mb-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              <Scan size={13} /> Modalidade
            </p>
            <p className="mt-1 text-sm font-medium text-stone-900 dark:text-stone-100">
              {imaging.modality}
            </p>
          </Card>
          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              <Layers size={13} /> Região
            </p>
            <p className="mt-1 text-sm font-medium text-stone-900 dark:text-stone-100">
              {imaging.bodyRegion ?? 'Não informada'}
            </p>
          </Card>
          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              <Stethoscope size={13} /> Técnica
            </p>
            <p className="mt-1 text-sm font-medium text-stone-900 dark:text-stone-100">
              {imaging.technique ?? 'Não informada'}
            </p>
          </Card>
        </div>
      </SectionCard>

      {imaging.impression && (
        <SectionCard
          title="Impressão diagnóstica"
          subtitle="Conclusão consolidada da leitura do exame"
          className="mb-4"
        >
          <div className="mt-1 flex items-start gap-3 rounded-lg border border-amber-600/40 bg-amber-50 p-4 dark:border-amber-400/40 dark:bg-amber-900">
            <Stethoscope
              size={18}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            />
            <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-100">
              {imaging.impression}
            </p>
          </div>
        </SectionCard>
      )}

      {altered.length > 0 && (
        <SectionCard
          title="Achados alterados"
          subtitle="Estruturas com alteração identificada"
          className="mb-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {altered.map(renderFinding)}
          </div>
        </SectionCard>
      )}

      {normal.length > 0 && (
        <SectionCard
          title="Achados sem alteração"
          subtitle="Estruturas avaliadas dentro dos limites da normalidade"
          className="mb-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {normal.map(renderFinding)}
          </div>
        </SectionCard>
      )}

      {imaging.differentials?.length > 0 && (
        <SectionCard
          title="Diagnósticos diferenciais"
          subtitle="Hipóteses sugeridas pelos achados, da mais para a menos provável"
          className="mb-4"
        >
          <div className="space-y-2">
            {imaging.differentials.map((differential, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-100/60 p-3 dark:border-stone-800 dark:bg-stone-800/60"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-800 text-xs font-bold text-white dark:bg-teal-500 dark:text-stone-950">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-100">
                  {differential}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {imaging.limitations && (
        <SectionCard
          title="Limitações técnicas"
          subtitle="Fatores que reduzem a confiança da leitura"
          className="mb-4"
        >
          <div className="mt-1 flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-100/60 p-4 dark:border-stone-800 dark:bg-stone-800/60">
            <Info
              size={18}
              className="mt-0.5 shrink-0 text-stone-500 dark:text-stone-400"
            />
            <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-100">
              {imaging.limitations}
            </p>
          </div>
        </SectionCard>
      )}

      {findings.length === 0 && (
        <Card className="p-8 text-center">
          <AlertTriangle
            size={32}
            className="mx-auto mb-2 text-stone-500/50 dark:text-stone-400/50"
          />
          <p className="text-stone-500 dark:text-stone-400">
            Nenhum achado foi identificado neste exame de imagem.
          </p>
        </Card>
      )}

      {altered.length === 0 && findings.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-50 p-3 dark:border-emerald-500/30 dark:bg-emerald-900">
          <CheckCircle2
            size={16}
            className="shrink-0 text-emerald-700 dark:text-emerald-500"
          />
          <p className="text-sm text-stone-800 dark:text-stone-100">
            Todas as estruturas avaliadas estão dentro dos limites da
            normalidade.
          </p>
        </div>
      )}
    </>
  );
}
