import type { ReactNode } from 'react';

import { BrandLogo } from './brand-logo';

import { cn } from '@/infra/utils';

interface ProductFrameProps {
  title?: string;
  badge?: string;
  img?: { src: string; alt: string };
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}

export function ProductFrame({
  title,
  badge,
  img,
  className,
  bodyClassName,
  children,
}: ProductFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[24px] border border-border bg-card shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-danger/60" />
            <span className="size-2.5 rounded-full bg-brand-sun/70" />
            <span className="size-2.5 rounded-full bg-success/60" />
          </span>
          {title && (
            <span className="text-xs font-semibold text-muted-foreground">
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {badge && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
              {badge}
            </span>
          )}
          <BrandLogo compact className="scale-90 origin-right" />
        </div>
      </div>

      {img ? (
        <img
          src={img.src}
          alt={img.alt}
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className={cn('p-4 sm:p-5', bodyClassName)}>{children}</div>
      )}
    </div>
  );
}
