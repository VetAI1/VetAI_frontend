'use client';

import { BrainCircuit, FileText, Sparkles } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/infra/utils';

const FINDINGS = [
  {
    label: 'Leucocitose',
    note: 'sugestivo de processo inflamatório ativo',
    level: 'Moderado',
  },
  {
    label: 'Plaquetas',
    note: 'dentro da faixa de referência para a espécie',
    level: 'Estável',
  },
  {
    label: 'Creatinina',
    note: 'valores normais, função renal preservada',
    level: 'Ok',
  },
] as const;

const LEVEL_TONE: Record<(typeof FINDINGS)[number]['level'], string> = {
  Moderado: 'bg-amber-500/20 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300',
  Estável: 'bg-emerald-700/10 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500',
  Ok: 'bg-sky-700/10 dark:bg-sky-500/10 text-sky-700 dark:text-sky-500',
};

export function CopilotDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reducedMotion = useReducedMotion();

  const [typing, setTyping] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setTyping(false);
      setAnalyzing(false);
      setVisible(FINDINGS.length);
      return;
    }

    const t1 = setTimeout(() => setTyping(true), 250);
    const t2 = setTimeout(() => setTyping(false), 650);
    const t3 = setTimeout(() => setAnalyzing(true), 650);
    const t4 = setTimeout(() => setAnalyzing(false), 1000);
    const reveals = FINDINGS.map((_, i) =>
      setTimeout(() => setVisible(i + 1), 1250 + i * 200),
    );
    return () => {
      [t1, t2, t3, t4, ...reveals].forEach(clearTimeout);
    };
  }, [inView, reducedMotion]);

  const status = analyzing ? 'Analisando resultados' : 'Análise pronta';

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-teal-800/10 dark:bg-teal-500/10 text-teal-800 dark:text-teal-500">
            <BrainCircuit size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100">Copilot VetAI</p>
            <p className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  analyzing ? 'bg-amber-500 dark:bg-amber-400 animate-pulse' : 'bg-emerald-700 dark:bg-emerald-500',
                )}
              />
              {status}
            </p>
          </div>
        </div>
        <span className="font-data rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-1 text-xs font-semibold text-teal-800 dark:text-teal-500">
          leitura #12
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="self-end rounded-2xl rounded-tr-sm bg-teal-800 dark:bg-teal-500 px-4 py-2.5 text-sm text-white dark:text-stone-950">
          <p className="flex items-center gap-2">
            <FileText size={14} />
            Hemograma da Luna enviado para leitura.
          </p>
        </div>

        <div className="flex gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-stone-100 dark:bg-stone-800 text-teal-800 dark:text-teal-500">
            <BrainCircuit size={15} />
          </span>
          <div className="min-w-0 flex-1">
            {(typing || analyzing) && (
              <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-stone-100 dark:bg-stone-800 px-4 py-3">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="typing-dot size-1.5 rounded-full bg-stone-500 dark:bg-stone-400"
                    style={{ animationDelay: `${dot * 120}ms` }}
                  />
                ))}
              </div>
            )}

            <AnimatePresence>
              {!typing && !analyzing && visible > 0 && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
                  className="space-y-2"
                >
                  <p className="w-fit rounded-2xl rounded-tl-sm bg-stone-100 dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100">
                    Identifiquei 3 pontos que merecem a sua revisão:
                  </p>
                  {FINDINGS.slice(0, visible).map((finding) => (
                    <motion.div
                      key={finding.label}
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.25,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {finding.label}
                        </p>
                        <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                          {finding.note}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                          LEVEL_TONE[finding.level],
                        )}
                      >
                        {finding.level}
                      </span>
                    </motion.div>
                  ))}
                  {visible >= FINDINGS.length && (
                    <motion.p
                      initial={reducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: reducedMotion ? 0 : 0.25 }}
                      className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-teal-800 dark:text-teal-500"
                    >
                      <Sparkles size={13} />
                      A decisão clínica é sua.
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
