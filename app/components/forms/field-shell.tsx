'use client';

import type { ReactNode } from 'react';

import { cn } from '@/infra/utils';

interface FieldShellProps {
  label?: string;
  required?: boolean | undefined;
  error?: string | undefined;
  className?: string;
  children: ReactNode;
}

export function FieldShell({
  label,
  required,
  error,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="mb-2 block text-sm font-semibold tracking-[-0.01em] text-stone-900 dark:text-stone-100">
          {label}
          {required && <span className="ml-0.5 text-red-600 dark:text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
}
