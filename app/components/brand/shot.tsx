import type { ReactNode } from 'react';

import { cn } from '@/infra/utils';

interface ShotProps {
  tilt?: 'left' | 'right';
  floating?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Shot({
  tilt = 'left',
  floating,
  className,
  children,
}: ShotProps) {
  return (
    <div className={cn('relative', className)}>
      <div
        aria-hidden="true"
        className={cn(
          'absolute -inset-5 -z-10 rounded-[32px] border border-teal-800/10 dark:border-teal-500/10 bg-stone-100/70 dark:bg-stone-800/70',
          tilt === 'left' ? '-rotate-3' : 'rotate-3',
        )}
      />
      {children}
      {floating}
    </div>
  );
}
