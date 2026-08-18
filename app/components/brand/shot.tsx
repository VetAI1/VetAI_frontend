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
          'absolute -inset-5 -z-10 rounded-[32px] border border-primary/10 bg-secondary/70',
          tilt === 'left' ? '-rotate-3' : 'rotate-3',
        )}
      />
      {children}
      {floating}
    </div>
  );
}
