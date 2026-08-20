'use client';

import {
  Activity,
  Beaker,
  BedDouble,
  ClipboardList,
  History,
  PawPrint,
} from 'lucide-react';
import { useState } from 'react';

import { BoxesTab } from './components/boxes-tab';
import { ExecutionMapTab } from './components/execution-map-tab';
import { HistoryTab } from './components/history-tab';
import { HospitalizedTab } from './components/hospitalized-tab';
import { ParametersTab } from './components/parameters-tab';
import { TemplatesTab } from './components/templates-tab';

import { Header } from '@/app/components/layout/header';
import { cn } from '@/infra/utils';

type MonitoringTab =
  | 'hospitalized'
  | 'map'
  | 'history'
  | 'boxes'
  | 'parameters'
  | 'templates';

const TABS: Array<{
  key: MonitoringTab;
  label: string;
  icon: typeof PawPrint;
  chip: string;
}> = [
  {
    key: 'hospitalized',
    label: 'Animais Internados',
    icon: PawPrint,
    chip: 'bg-teal-800/10 text-teal-800 dark:bg-teal-500/15 dark:text-teal-400',
  },
  {
    key: 'map',
    label: 'Mapa de Execução',
    icon: Activity,
    chip: 'bg-sky-700/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
  },
  {
    key: 'history',
    label: 'Histórico',
    icon: History,
    chip: 'bg-stone-500/10 text-stone-500 dark:bg-stone-400/15 dark:text-stone-300',
  },
  {
    key: 'boxes',
    label: 'Boxes',
    icon: BedDouble,
    chip: 'bg-amber-600/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400',
  },
  {
    key: 'parameters',
    label: 'Parâmetros Clínicos',
    icon: Beaker,
    chip: 'bg-purple-600/10 text-purple-600 dark:bg-purple-400/15 dark:text-purple-400',
  },
  {
    key: 'templates',
    label: 'Modelos de Prescrição',
    icon: ClipboardList,
    chip: 'bg-rose-600/10 text-rose-600 dark:bg-rose-400/15 dark:text-rose-400',
  },
];

export default function Monitoring() {
  const [tab, setTab] = useState<MonitoringTab>('hospitalized');

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Internação" showStorage={false} />

        <div className="mb-6 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2">
          <nav className="flex gap-1.5 overflow-x-auto scrollbar-thin">
            {TABS.map(({ key, label, icon: Icon, chip }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors',
                  tab === key
                    ? 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 shadow-[var(--shadow-brand)]'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800',
                )}
              >
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-md transition-colors',
                    tab === key
                      ? 'bg-white/15 text-white dark:bg-stone-950/15 dark:text-stone-950'
                      : chip,
                  )}
                >
                  <Icon size={14} />
                </span>
                {label}
              </button>
            ))}
          </nav>
        </div>

        {tab === 'hospitalized' && <HospitalizedTab />}
        {tab === 'map' && <ExecutionMapTab />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'boxes' && <BoxesTab />}
        {tab === 'parameters' && <ParametersTab />}
        {tab === 'templates' && <TemplatesTab />}
      </div>
    </div>
  );
}
