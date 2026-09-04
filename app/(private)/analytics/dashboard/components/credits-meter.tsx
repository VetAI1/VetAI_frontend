'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/infra/utils';

interface CreditsMeterProps {
  available: number;
  total: number;
  loading?: boolean;
}

function format(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function CreditsMeter({
  available,
  total,
  loading = false,
}: CreditsMeterProps) {
  const used = Math.max(total - available, 0);
  const percentUsed = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const rounded = Math.round(percentUsed);

  const severity =
    percentUsed >= 90 ? 'critical' : percentUsed >= 70 ? 'warning' : 'normal';

  return (
    <div className="flex flex-col rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
        Créditos de IA
      </p>

      {loading ? (
        <>
          <Skeleton className="mt-4 h-9 w-32" />
          <Skeleton className="mt-4 h-2 w-full rounded-full" />
          <Skeleton className="mt-3 h-3 w-40" />
        </>
      ) : (
        <>
          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="font-data text-3xl font-semibold tracking-[-0.04em] text-stone-900 dark:text-stone-100">
              {format(used)}
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              / {format(total)} créditos
            </span>
          </p>

          <div
            className={cn(
              'mt-4 h-2 overflow-hidden rounded-full',
              severity === 'critical' && 'bg-red-600/15 dark:bg-red-500/15',
              severity === 'warning' && 'bg-amber-600/15 dark:bg-amber-500/15',
              severity === 'normal' && 'bg-teal-700/15 dark:bg-teal-600/20',
            )}
            role="progressbar"
            aria-valuenow={rounded}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Créditos de IA usados no período"
          >
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none',
                severity === 'critical' && 'bg-red-600 dark:bg-red-500',
                severity === 'warning' && 'bg-amber-600 dark:bg-amber-500',
                severity === 'normal' && 'bg-teal-700 dark:bg-teal-600',
              )}
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
            <span className="font-data">{rounded}% usado</span>
            <span className="font-data">
              {format(available)} restantes
            </span>
          </div>
        </>
      )}
    </div>
  );
}
