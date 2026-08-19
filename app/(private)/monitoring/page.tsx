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

const TABS: Array<{ key: MonitoringTab; label: string; icon: typeof PawPrint }> = [
  { key: 'hospitalized', label: 'Animais Internados', icon: PawPrint },
  { key: 'map', label: 'Mapa de Execução', icon: Activity },
  { key: 'history', label: 'Histórico', icon: History },
  { key: 'boxes', label: 'Boxes', icon: BedDouble },
  { key: 'parameters', label: 'Parâmetros Clínicos', icon: Beaker },
  { key: 'templates', label: 'Modelos de Prescrição', icon: ClipboardList },
];

export default function Monitoring() {
  const [tab, setTab] = useState<MonitoringTab>('hospitalized');

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header title="Internação" showStorage={false} />

        <div className="mb-6 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2">
          <nav className="flex gap-1.5 overflow-x-auto scrollbar-thin">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                  tab === key
                    ? 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 shadow-[var(--shadow-brand)]'
                    : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100',
                )}
              >
                <Icon size={16} />
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
