'use client';

import { Activity, BedDouble, Check, Clock, Syringe } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useReveal } from '@/hooks/use-reveal';
import { cn } from '@/infra/utils';

const VITALS = [
  { label: 'FC', value: '92', unit: 'bpm' },
  { label: 'FR', value: '24', unit: 'mpm' },
  { label: 'Temp.', value: '38,5', unit: '°C' },
  { label: 'PA', value: '120', unit: 'mmHg' },
];

const EXECUTIONS = [
  { time: '06:00', label: 'Meloxicam' },
  { time: '12:00', label: 'Meloxicam' },
  { time: '18:00', label: 'Meloxicam' },
  { time: '00:00', label: 'Meloxicam' },
];

const PHASES = ['admission', 'prescription', 'executions', 'vitals'] as const;
type Phase = (typeof PHASES)[number];

const PHASE_DURATION: Record<Phase, number> = {
  admission: 2600,
  prescription: 2600,
  executions: 4200,
  vitals: 4200,
};

const PHASE_LABEL: Record<Phase, string> = {
  admission: 'Paciente admitido',
  prescription: 'Prescrição ativa',
  executions: 'Mapa de execuções',
  vitals: 'Aferição registrada',
};

export function HospitalizationDemo() {
  const { ref, isVisible, prefersReducedMotion } = useReveal({ threshold: 0.2 });
  const [index, setIndex] = useState(0);

  const phase: Phase = prefersReducedMotion
    ? 'vitals'
    : (PHASES[index] ?? 'admission');

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return;

    const timeout = setTimeout(
      () => setIndex((value) => (value + 1) % PHASES.length),
      PHASE_DURATION[phase],
    );

    return () => clearTimeout(timeout);
  }, [isVisible, prefersReducedMotion, phase]);

  const phaseIndex = PHASES.indexOf(phase);
  const showPrescription = phaseIndex >= 1;
  const showExecutions = phaseIndex >= 2;
  const showVitals = phaseIndex >= 3;
  const doneExecutions = showVitals
    ? EXECUTIONS.length - 1
    : showExecutions
      ? 2
      : 0;

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[var(--shadow-card)] dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-100/50 px-4 py-3 dark:border-stone-800 dark:bg-stone-800/50">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-800/10 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500">
            <BedDouble size={15} />
          </span>
          <div>
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Luna · Box 01
            </p>
            <p className="font-data text-[10px] text-stone-500 dark:text-stone-400">
              Internada há 1 dia · 28,4 kg
            </p>
          </div>
        </div>
        <span className="font-data flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-500">
          <span className="size-1.5 rounded-full bg-teal-800 dark:bg-teal-500 animate-pulse" />
          {PHASE_LABEL[phase]}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Internado', tone: 'teal' },
            { label: 'Risco médio', tone: 'amber' },
            { label: 'Estável', tone: 'emerald' },
          ].map((badge, badgeIndex) => (
            <span
              key={badge.label}
              className={cn(
                'animate-in rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider fade-in duration-300 [animation-timing-function:var(--ease-brand)]',
                badge.tone === 'teal' &&
                  'bg-teal-800/10 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500',
                badge.tone === 'amber' &&
                  'bg-amber-500/20 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300',
                badge.tone === 'emerald' &&
                  'bg-emerald-700/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500',
              )}
              style={{ animationDelay: `${badgeIndex * 80}ms` }}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <div
          className={cn(
            'overflow-hidden rounded-xl border border-stone-200 bg-[oklch(0.985_0.01_95)] transition-[max-height,opacity] duration-500 dark:border-stone-800 dark:bg-stone-950',
            showPrescription ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="flex items-center gap-3 px-3.5 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-teal-800/10 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500">
              <Syringe size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                Meloxicam · 0,1 mg/kg
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                A cada 6h por 3 dias · via oral
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'transition-opacity duration-500',
            showExecutions ? 'opacity-100' : 'opacity-40',
          )}
        >
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            <Clock size={11} />
            Execuções do dia
          </p>
          <div className="grid grid-cols-4 gap-2">
            {EXECUTIONS.map((execution, executionIndex) => {
              const done = executionIndex < doneExecutions;
              return (
                <div
                  key={execution.time}
                  className={cn(
                    'rounded-xl border px-2 py-2.5 text-center transition-colors duration-500',
                    done
                      ? 'border-emerald-700/25 bg-emerald-700/10 dark:border-emerald-500/25 dark:bg-emerald-500/10'
                      : 'border-dashed border-stone-200 dark:border-stone-800',
                  )}
                >
                  <span
                    className={cn(
                      'font-data block text-xs font-bold',
                      done
                        ? 'text-emerald-700 dark:text-emerald-500'
                        : 'text-stone-500 dark:text-stone-400',
                    )}
                  >
                    {execution.time}
                  </span>
                  <span
                    className={cn(
                      'mx-auto mt-1.5 grid size-4 place-items-center rounded-full transition-colors duration-500',
                      done
                        ? 'bg-emerald-700 text-white dark:bg-emerald-500 dark:text-stone-950'
                        : 'bg-stone-200 text-transparent dark:bg-stone-800',
                    )}
                  >
                    <Check size={9} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            'rounded-xl border border-stone-200 p-3 transition-opacity duration-500 dark:border-stone-800',
            showVitals ? 'opacity-100' : 'opacity-40',
          )}
        >
          <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            <Activity size={11} />
            Sinais vitais
          </p>
          <div className="grid grid-cols-4 gap-2">
            {VITALS.map((vital, vitalIndex) => (
              <div key={vital.label} className="text-center">
                <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                  {vital.label}
                </p>
                <p
                  className={cn(
                    'font-data mt-0.5 text-sm font-semibold tracking-[-0.04em] text-stone-900 transition-opacity duration-500 dark:text-stone-100',
                    showVitals ? 'opacity-100' : 'opacity-0',
                  )}
                  style={{ transitionDelay: `${vitalIndex * 110}ms` }}
                >
                  {vital.value}
                  <span className="ml-0.5 text-[9px] font-normal text-stone-500 dark:text-stone-400">
                    {vital.unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 border-t border-stone-200 px-4 py-3 dark:border-stone-800">
        {PHASES.map((item, itemIndex) => (
          <span
            key={item}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-500',
              itemIndex <= phaseIndex
                ? 'bg-teal-800 dark:bg-teal-500'
                : 'bg-stone-200 dark:bg-stone-800',
            )}
          />
        ))}
      </div>
    </div>
  );
}
