'use client';

import {
  CalendarDays,
  CreditCard,
  PawPrint,
  Syringe,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { useReveal } from '@/hooks/use-reveal';
import { cn } from '@/infra/utils';

interface ModuleRow {
  primary: string;
  secondary: string;
  trailing: string;
  tone?: 'neutral' | 'positive' | 'warning';
}

interface ManagementModule {
  id: string;
  label: string;
  icon: React.ElementType;
  columns: [string, string, string];
  rows: ModuleRow[];
}

const MODULES: ManagementModule[] = [
  {
    id: 'patients',
    label: 'Pacientes',
    icon: PawPrint,
    columns: ['Paciente', 'Raça', 'Prontuário'],
    rows: [
      { primary: 'Luna', secondary: 'Golden Retriever · 5 anos', trailing: '#001' },
      { primary: 'Mingau', secondary: 'Siamês · 3 anos', trailing: '#002' },
      { primary: 'Thor', secondary: 'Pastor Alemão · 7 anos', trailing: '#003' },
    ],
  },
  {
    id: 'tutors',
    label: 'Tutores',
    icon: Users,
    columns: ['Tutor', 'Contato', 'Pets'],
    rows: [
      { primary: 'Mariana Oliveira', secondary: '(11) 98888-1111', trailing: '2 pets' },
      { primary: 'Carlos Mendes', secondary: '(11) 97777-2222', trailing: '1 pet' },
      { primary: 'Juliana Braga', secondary: '(11) 96666-3333', trailing: '3 pets' },
    ],
  },
  {
    id: 'vaccines',
    label: 'Vacinas',
    icon: Syringe,
    columns: ['Vacina', 'Paciente', 'Próxima dose'],
    rows: [
      { primary: 'V10', secondary: 'Luna', trailing: 'em 30 dias', tone: 'positive' },
      { primary: 'Antirrábica', secondary: 'Thor', trailing: 'em 7 dias', tone: 'warning' },
      { primary: 'Quádrupla felina', secondary: 'Mingau', trailing: 'em 92 dias', tone: 'positive' },
    ],
  },
  {
    id: 'payments',
    label: 'Pagamentos',
    icon: CreditCard,
    columns: ['Cobrança', 'Tutor', 'Valor'],
    rows: [
      { primary: 'Consulta clínica', secondary: 'Mariana Oliveira', trailing: 'R$ 150,00', tone: 'positive' },
      { primary: 'Vacina V10', secondary: 'Carlos Mendes', trailing: 'R$ 120,00', tone: 'warning' },
      { primary: 'Hemograma', secondary: 'Juliana Braga', trailing: 'R$ 90,00', tone: 'positive' },
    ],
  },
  {
    id: 'schedule',
    label: 'Agenda',
    icon: CalendarDays,
    columns: ['Horário', 'Atendimento', 'Status'],
    rows: [
      { primary: '09:00', secondary: 'Retorno da Luna', trailing: 'Confirmado', tone: 'positive' },
      { primary: '10:30', secondary: 'Vacina do Mingau', trailing: 'Agendado' },
      { primary: '14:00', secondary: 'Consulta do Thor', trailing: 'Agendado' },
    ],
  },
];

const AUTOPLAY_MS = 3600;

const TONE_STYLES = {
  neutral: 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400',
  positive:
    'bg-emerald-700/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500',
  warning:
    'bg-amber-500/20 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300',
} as const;

export function ManagementDemo() {
  const { ref, isVisible, prefersReducedMotion } = useReveal({ threshold: 0.2 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % MODULES.length);
      setCycle((value) => value + 1);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(interval);
  }, [isVisible, prefersReducedMotion]);

  const activeModule = MODULES[activeIndex] ?? MODULES[0];

  if (!activeModule) return null;

  const selectModule = (index: number) => {
    setActiveIndex(index);
    setCycle((value) => value + 1);
  };

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[var(--shadow-card)] dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100/50 px-4 py-3 dark:border-stone-800 dark:bg-stone-800/50">
        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
          Clínica VetAI
        </p>
        <span className="font-data text-[10px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-500">
          {activeModule.label}
        </span>
      </div>

      <div className="grid sm:grid-cols-[168px_1fr]">
        <div className="flex gap-1 overflow-x-auto border-b border-stone-200 p-2 dark:border-stone-800 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r">
          {MODULES.map((module, index) => {
            const isActive = index === activeIndex;
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => selectModule(index)}
                aria-pressed={isActive}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors duration-200',
                  isActive
                    ? 'bg-teal-800/10 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500'
                    : 'text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800',
                )}
              >
                <Icon size={15} className="shrink-0" />
                {module.label}
              </button>
            );
          })}
        </div>

        <div className="min-w-0 p-4">
          <div
            key={`${activeModule.id}-${cycle}`}
            className="animate-in fade-in duration-300 [animation-timing-function:var(--ease-brand)]"
          >
            <div className="grid grid-cols-[1.4fr_1fr] gap-3 border-b border-stone-200 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:text-stone-400 sm:grid-cols-[1.3fr_1.2fr_0.8fr]">
              <span>{activeModule.columns[0]}</span>
              <span className="hidden sm:block">{activeModule.columns[1]}</span>
              <span className="text-right">{activeModule.columns[2]}</span>
            </div>

            <div className="divide-y divide-stone-200 dark:divide-stone-800">
              {activeModule.rows.map((row, index) => (
                <div
                  key={row.primary}
                  className="animate-in grid grid-cols-[1.4fr_1fr] items-center gap-3 py-3 fade-in slide-in-from-bottom-1 duration-300 [animation-timing-function:var(--ease-brand)] sm:grid-cols-[1.3fr_1.2fr_0.8fr]"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <span className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {row.primary}
                  </span>
                  <span className="hidden truncate text-xs text-stone-500 dark:text-stone-400 sm:block">
                    {row.secondary}
                  </span>
                  <span className="flex justify-end">
                    <span
                      className={cn(
                        'font-data truncate rounded-full px-2 py-1 text-[10px] font-bold',
                        TONE_STYLES[row.tone ?? 'neutral'],
                      )}
                    >
                      {row.trailing}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
