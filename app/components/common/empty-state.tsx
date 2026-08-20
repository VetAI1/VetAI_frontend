import { SearchX, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/infra/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'Nenhum registro encontrado',
  description,
  icon: Icon = SearchX,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-stone-200 dark:border-stone-800 bg-stone-100/35 dark:bg-stone-800/35 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="grid size-10 place-items-center rounded-full bg-teal-800/10 dark:bg-teal-500/10 text-teal-800 dark:text-teal-500">
        <Icon size={20} />
      </span>
      <p className="mt-3 text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm leading-6 text-stone-500 dark:text-stone-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
