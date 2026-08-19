'use client';

import { Download, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { buildHospitalizationReportPdf } from '../report-pdf';

import { Button } from '@/components/ui/button';
import { hospitalsService } from '@/services/hospitals.service';
import { monitoringService } from '@/services/monitoring.service';
import type { Hospitalization } from '@/types/monitoring';

interface ReportModalProps {
  hospitalization: Hospitalization;
  onClose: () => void;
}

export function ReportModal({ hospitalization, onClose }: ReportModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [save, setSave] = useState<(() => void) | null>(null);

  useEffect(() => {
    let active = true;
    let url: string | null = null;

    async function load() {
      try {
        const [hospital, vitals, prescriptions, executions, events] =
          await Promise.all([
            hospitalsService.get().catch(() => null),
            monitoringService.listVitals(hospitalization.id).catch(() => []),
            monitoringService
              .listPrescriptions(hospitalization.id)
              .catch(() => []),
            monitoringService
              .listExecutionsByHospitalization(hospitalization.id)
              .catch(() => []),
            monitoringService
              .listEvents(hospitalization.id, { size: 500 })
              .then((response) => response.data)
              .catch(() => []),
          ]);

        if (!active) return;

        const pdf = await buildHospitalizationReportPdf({
          hospitalization,
          hospital,
          vitals,
          prescriptions,
          executions,
          events,
        });

        if (!active) return;

        // A pré-visualização é o próprio arquivo: o que aparece na tela é
        // exatamente o que o botão de baixar salva.
        url = URL.createObjectURL(pdf.output('blob'));
        setPreviewUrl(url);
        setSave(() => () => {
          pdf.save(
            `Prontuario - ${hospitalization.patient?.name ?? 'paciente'}.pdf`,
          );
        });
      } catch {
        if (active) toast.error('Não foi possível montar o prontuário.');
      }
    }

    void load();
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [hospitalization]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/70 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 bg-teal-800 dark:bg-teal-500 px-4 py-3 text-white dark:text-stone-950">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            Prontuário de internação
          </p>
          <p className="text-xs text-white/70 dark:text-stone-950/70 truncate">
            {hospitalization.patient?.name}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => save?.()}
            disabled={!save}
            className="text-white/70 dark:text-stone-950/70 hover:text-white dark:hover:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
          >
            <Download size={16} />
            Baixar PDF
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/70 dark:text-stone-950/70 hover:text-white dark:hover:text-stone-950 hover:bg-teal-800/90 dark:hover:bg-teal-500/90"
            title="Fechar"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-slate-600">
        {previewUrl ? (
          <iframe
            src={previewUrl}
            title="Prontuário de internação"
            className="h-full w-full border-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Loader2 size={28} className="animate-spin text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
