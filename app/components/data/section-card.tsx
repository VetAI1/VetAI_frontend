import type { ReactNode } from 'react';

interface SectionCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  clipContent?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  children,
  className = '',
  headerAction,
  clipContent = false,
}: SectionCardProps) {
  return (
    <div
      className={`rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 ${className}`}
    >
      <div
        className={`mb-4 ${headerAction ? 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0' : ''}`}
      >
        <div className="min-w-0">
          <div className="text-base font-semibold text-stone-900 dark:text-stone-100">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
              {subtitle}
            </div>
          )}
        </div>
        {headerAction && <div className="w-full sm:w-auto shrink-0">{headerAction}</div>}
      </div>
      <div
        className={`flex flex-col flex-1 min-h-0 ${clipContent ? 'overflow-hidden' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
