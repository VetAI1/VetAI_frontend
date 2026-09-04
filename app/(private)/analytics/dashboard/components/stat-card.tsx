'use client';

import { Sparkline } from './sparkline';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/infra/utils';

interface StatCardProps {
  label: string;
  value: number;
  series?: number[];
  color?: string;
  delta?: number | null;
  deltaLabel?: string;
  footnote?: string;
  loading?: boolean;
}

function formatValue(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatDelta(delta: number): string {
  const signal = delta > 0 ? '+' : '';
  return `${signal}${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(delta)}%`;
}

export function StatCard({
  label,
  value,
  series,
  color,
  delta,
  deltaLabel,
  footnote,
  loading = false,
}: StatCardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
        {label}
      </p>

      <div className="mt-3 min-h-[44px]">
        {loading ? (
          <Skeleton className="h-[44px] w-full rounded-md" />
        ) : series && series.length > 1 && color ? (
          <Sparkline data={series} color={color} />
        ) : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        {loading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <span className="font-data text-3xl font-semibold tracking-[-0.04em] text-stone-900 dark:text-stone-100">
            {formatValue(value)}
          </span>
        )}

        {!loading && delta !== null && delta !== undefined && (
          <span
            className={cn(
              'font-data rounded-full px-2 py-0.5 text-xs font-bold',
              delta > 0 &&
                'bg-emerald-700/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500',
              delta < 0 &&
                'bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-500',
              delta === 0 &&
                'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400',
            )}
          >
            {formatDelta(delta)}
          </span>
        )}
      </div>

      {!loading && (deltaLabel || footnote) && (
        <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
          {footnote ?? deltaLabel}
        </p>
      )}
    </div>
  );
}
