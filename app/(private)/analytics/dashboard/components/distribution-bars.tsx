'use client';

import { EmptyState } from '@/app/components/common/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface DistributionBarsProps {
  labels: string[];
  values: number[];
  color: string;
  loading?: boolean;
  emptyTitle?: string;
}

export function DistributionBars({
  labels,
  values,
  color,
  loading = false,
  emptyTitle = 'Sem dados no período',
}: DistributionBarsProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3.5">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-8 w-full rounded-md" />
        ))}
      </div>
    );
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return <EmptyState title={emptyTitle} className="h-full" />;
  }

  const max = Math.max(...values);
  const rows = labels
    .map((label, index) => ({ label, value: values[index] ?? 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((row) => {
        const share = total > 0 ? (row.value / total) * 100 : 0;
        return (
          <div key={row.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-stone-900 dark:text-stone-100">
                {row.label}
              </span>
              <span className="font-data shrink-0 text-xs text-stone-500 dark:text-stone-400">
                {new Intl.NumberFormat('pt-BR').format(row.value)}
                <span className="ml-1.5">{Math.round(share)}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${max > 0 ? (row.value / max) * 100 : 0}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
