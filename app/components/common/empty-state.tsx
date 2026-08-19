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
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/35 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon size={20} />
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
