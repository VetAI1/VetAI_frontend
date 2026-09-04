'use client';

import { Check, Download, FileText, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useReveal } from '@/hooks/use-reveal';
import { cn } from '@/infra/utils';

interface DemoMedication {
  drug: string;
  posology: string;
  quantity: string;
}

const MEDICATIONS: DemoMedication[] = [
  {
    drug: 'Meloxicam 0,5 mg/mL',
    posology: '0,1 mg/kg · VO · a cada 24h por 3 dias',
    quantity: '1 frasco',
  },
  {
    drug: 'Omeprazol 10 mg',
    posology: '1 mg/kg · VO · a cada 24h por 5 dias',
    quantity: '10 cápsulas',
  },
  {
    drug: 'Dipirona 500 mg/mL',
    posology: '25 mg/kg · VO · a cada 8h por 3 dias',
    quantity: '1 frasco',
  },
];

const TOTAL_STEPS = MEDICATIONS.length + 2;

export function PrescriptionDemo() {
  const { ref, isVisible, prefersReducedMotion } = useReveal({ threshold: 0.25 });
  const [step, setStep] = useState(0);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    if (prefersReducedMotion) {
      setStep(TOTAL_STEPS);
      return;
    }

    setStep(0);

    const timeouts = Array.from({ length: TOTAL_STEPS }, (_, index) =>
      setTimeout(() => setStep(index + 1), 600 + index * 850),
    );

    const restart = setTimeout(
      () => setLoop((value) => value + 1),
      600 + TOTAL_STEPS * 850 + 2600,
    );

    return () => {
      [...timeouts, restart].forEach(clearTimeout);
    };
  }, [isVisible, prefersReducedMotion, loop]);

  const visibleMedications = Math.min(step, MEDICATIONS.length);
  const documentReady = step >= MEDICATIONS.length + 1;
  const downloadReady = step >= TOTAL_STEPS;

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[var(--shadow-card)] dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100/50 px-4 py-3 dark:border-stone-800 dark:bg-stone-800/50">
        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
          Nova receita · Luna
        </p>
        <span
          className={cn(
            'font-data flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300',
            documentReady
              ? 'text-emerald-700 dark:text-emerald-500'
              : 'text-stone-500 dark:text-stone-400',
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              documentReady
                ? 'bg-emerald-700 dark:bg-emerald-500'
                : 'bg-amber-500 dark:bg-amber-400 animate-pulse',
            )}
          />
          {documentReady ? 'Documento pronto' : 'Montando receita'}
        </span>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {MEDICATIONS.map((medication, index) => {
            const revealed = index < visibleMedications;
            return (
              <div
                key={medication.drug}
                className={cn(
                  'flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-[opacity,transform] duration-300 [transition-timing-function:var(--ease-brand)]',
                  revealed
                    ? 'translate-y-0 border-stone-200 bg-[oklch(0.985_0.01_95)] opacity-100 dark:border-stone-800 dark:bg-stone-950'
                    : 'translate-y-2 border-dashed border-stone-200 bg-transparent opacity-0 dark:border-stone-800',
                )}
              >
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal-800/10 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500">
                  <Check size={11} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {medication.drug}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    {medication.posology}
                  </p>
                </div>
                <span className="font-data shrink-0 text-[10px] font-bold text-stone-500 dark:text-stone-400">
                  {medication.quantity}
                </span>
              </div>
            );
          })}

          {visibleMedications < MEDICATIONS.length && (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-stone-200 px-3.5 py-3 text-xs font-semibold text-stone-500 dark:border-stone-800 dark:text-stone-400">
              <Plus size={13} />
              Adicionando medicamento…
            </div>
          )}
        </div>

        <div
          className={cn(
            'mt-4 overflow-hidden rounded-xl border border-stone-200 bg-[oklch(0.985_0.01_95)] transition-[max-height,opacity] duration-500 dark:border-stone-800 dark:bg-stone-950',
            documentReady ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="flex items-center gap-3 border-b border-stone-200 px-3.5 py-2.5 dark:border-stone-800">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-800/10 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500">
              <FileText size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-stone-900 dark:text-stone-100">
                receita-luna.pdf
              </p>
              <p className="font-data text-[10px] text-stone-500 dark:text-stone-400">
                A4 · timbrado da clínica · CRMV e assinatura
              </p>
            </div>
          </div>

          <div className="space-y-1.5 px-3.5 py-3" aria-hidden="true">
            {[86, 72, 94, 64].map((width, index) => (
              <span
                key={width}
                className="block h-1.5 rounded-full bg-stone-200 dark:bg-stone-800"
                style={{ width: `${width}%`, opacity: 1 - index * 0.15 }}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 [transition-timing-function:var(--ease-brand)]',
            downloadReady
              ? 'bg-teal-800 text-white dark:bg-teal-500 dark:text-stone-950'
              : 'cursor-default bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400',
          )}
        >
          <Download size={15} />
          Baixar PDF
        </button>
      </div>
    </div>
  );
}
