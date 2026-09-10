'use client';

import {
  Check,
  FileText,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  UploadCloud,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import { cn } from '@/infra/utils';
import type { ExamValueStatus } from '@/types/study';

interface AnimatedExamValue {
  title: string;
  value: string;
  unit: string;
  status: ExamValueStatus;
  reference: string;
}

const EXAM_VALUES: AnimatedExamValue[] = [
  {
    title: 'Hemácias',
    value: '6,8',
    unit: 'mi/µL',
    status: 'REGULAR',
    reference: '5,5 – 8,5',
  },
  {
    title: 'Hematócrito',
    value: '38',
    unit: '%',
    status: 'REGULAR',
    reference: '37 – 55',
  },
  {
    title: 'Leucócitos',
    value: '18.400',
    unit: '/µL',
    status: 'HIGHER',
    reference: '6.000 – 17.000',
  },
  {
    title: 'Plaquetas',
    value: '148',
    unit: 'mil/µL',
    status: 'LOWER',
    reference: '200 – 500',
  },
];

const TREATMENTS = [
  'Hemograma seriado em 48h',
  'Pesquisa de hemoparasitas',
  'Suporte clínico e hidratação',
];

const STAGES = ['upload', 'analysis', 'results', 'diagnosis'] as const;
type Stage = (typeof STAGES)[number];

const STAGE_DURATION: Record<Stage, number> = {
  upload: 3200,
  analysis: 2900,
  results: 4600,
  diagnosis: 5200,
};

const STAGE_LABEL: Record<Stage, string> = {
  upload: 'Enviando exame',
  analysis: 'Analisando com IA',
  results: 'Resultados extraídos',
  diagnosis: 'Diagnóstico sugerido',
};

const STATUS_ICON = {
  REGULAR: Check,
  HIGHER: TrendingUp,
  LOWER: TrendingDown,
} as const;

const STATUS_LABEL: Record<ExamValueStatus, string> = {
  REGULAR: 'Normal',
  HIGHER: 'Alto',
  LOWER: 'Baixo',
};

function useStageCycle(enabled: boolean): Stage {
  const [index, setIndex] = useState(0);
  const current = STAGES[index] ?? 'upload';

  useEffect(() => {
    if (!enabled) return;

    const timeout = setTimeout(
      () => setIndex((value) => (value + 1) % STAGES.length),
      STAGE_DURATION[current],
    );

    return () => clearTimeout(timeout);
  }, [enabled, current]);

  return enabled ? current : 'diagnosis';
}

function StatusBadge({ status }: { status: ExamValueStatus }) {
  const Icon = STATUS_ICON[status];
  const altered = status !== 'REGULAR';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]',
        altered
          ? 'bg-amber-500/20 text-amber-500 dark:bg-amber-400/20 dark:text-amber-400'
          : 'bg-white/10 text-white/70 dark:bg-stone-950/10 dark:text-stone-950/70',
      )}
    >
      <Icon size={10} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function AuthExamAnimation() {
  const reducedMotion = useReducedMotion();
  const stage = useStageCycle(!reducedMotion);

  const stageIndex = STAGES.indexOf(stage);

  return (
    <div
      className="w-full max-w-md xl:max-w-lg"
      role="img"
      aria-label="Demonstração: envio de um exame em PDF, análise por inteligência artificial, extração dos resultados e sugestão de diagnóstico e tratamentos."
    >
      <div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[var(--shadow-brand)] dark:border-stone-950/15 dark:bg-stone-950/10">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-amber-500 dark:bg-stone-950/10 dark:text-amber-400">
            <FileText size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white dark:text-stone-950">
              hemograma-luna.pdf
            </p>
            <p className="font-data text-xs text-white/60 dark:text-stone-950/60">
              248 KB · Luna, 5 anos
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={stage}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-white/70 dark:text-stone-950/70"
            >
              {STAGE_LABEL[stage]}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="relative mt-4 h-[248px] overflow-hidden xl:h-[300px]">
          <AnimatePresence mode="wait">
            {stage === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col items-center justify-center gap-5 rounded-xl border border-dashed border-white/25 dark:border-stone-950/25"
              >
                <motion.span
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex size-12 items-center justify-center rounded-xl bg-white/10 text-white dark:bg-stone-950/10 dark:text-stone-950"
                >
                  <UploadCloud size={22} />
                </motion.span>
                <div className="w-40">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/15 dark:bg-stone-950/15">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.4, ease: 'easeInOut' }}
                      className="h-full rounded-full bg-amber-500 dark:bg-amber-400"
                    />
                  </div>
                  <p className="mt-2 text-center font-data text-xs text-white/60 dark:text-stone-950/60">
                    Upload seguro
                  </p>
                </div>
              </motion.div>
            )}

            {stage === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative h-full overflow-hidden rounded-xl border border-white/15 bg-white/5 p-4 dark:border-stone-950/15 dark:bg-stone-950/5"
              >
                <div className="space-y-2.5">
                  {[92, 78, 85, 64, 88, 71, 80].map((width, position) => (
                    <motion.div
                      key={width + position}
                      initial={{ opacity: 0.25 }}
                      animate={{ opacity: [0.25, 0.6, 0.25] }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        delay: position * 0.12,
                      }}
                      style={{ width: `${width}%` }}
                      className="h-2.5 rounded-full bg-white/40 dark:bg-stone-950/40"
                    />
                  ))}
                </div>

                <motion.div
                  initial={{ y: '-100%' }}
                  animate={{ y: '340%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent dark:via-amber-400/30"
                />

                <div className="absolute inset-x-4 bottom-4 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 dark:bg-stone-950/10">
                  <Sparkles
                    size={13}
                    className="shrink-0 text-amber-500 dark:text-amber-400"
                  />
                  <span className="text-xs text-white/80 dark:text-stone-950/80">
                    Extraindo valores e referências
                  </span>
                </div>
              </motion.div>
            )}

            {stage === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full space-y-2"
              >
                {EXAM_VALUES.map((examValue, position) => (
                  <motion.div
                    key={examValue.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: position * 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 dark:border-stone-950/10 dark:bg-stone-950/5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-white dark:text-stone-950">
                        {examValue.title}
                      </p>
                      <p className="font-data text-[10px] text-white/50 dark:text-stone-950/50">
                        ref. {examValue.reference}
                      </p>
                    </div>
                    <span className="font-data text-sm font-semibold tracking-[-0.04em] text-white dark:text-stone-950">
                      {examValue.value}
                      <span className="ml-1 text-[10px] font-normal text-white/50 dark:text-stone-950/50">
                        {examValue.unit}
                      </span>
                    </span>
                    <StatusBadge status={examValue.status} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {stage === 'diagnosis' && (
              <motion.div
                key="diagnosis"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col gap-3"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 dark:border-amber-400/30 dark:bg-amber-400/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-white dark:text-stone-950">
                      <Stethoscope
                        size={15}
                        className="shrink-0 text-amber-500 dark:text-amber-400"
                      />
                      Leucocitose com trombocitopenia
                    </span>
                    <span className="font-data shrink-0 text-sm font-semibold text-amber-500 dark:text-amber-400">
                      78%
                    </span>
                  </div>
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/15 dark:bg-stone-950/15">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '78%' }}
                      transition={{
                        duration: 1,
                        delay: 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="h-full rounded-full bg-amber-500 dark:bg-amber-400"
                    />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 dark:text-stone-950/60">
                    Tratamentos sugeridos
                  </p>
                  {TREATMENTS.map((treatment, position) => (
                    <motion.div
                      key={treatment}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.7 + position * 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 dark:border-stone-950/10 dark:bg-stone-950/5"
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 dark:bg-amber-400/20 dark:text-amber-400">
                        <Check size={10} />
                      </span>
                      <span className="text-xs text-white/85 dark:text-stone-950/85">
                        {treatment}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2" aria-hidden="true">
        {STAGES.map((item, position) => (
          <span
            key={item}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-500',
              position <= stageIndex
                ? 'bg-amber-500 dark:bg-amber-400'
                : 'bg-white/15 dark:bg-stone-950/15',
            )}
          />
        ))}
      </div>
    </div>
  );
}
