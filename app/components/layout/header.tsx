'use client';

interface HeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  usedGB?: number;
  totalGB?: number;
  showStorage?: boolean;
  headerAction?: React.ReactNode;
}

export function Header({ title, subtitle, headerAction }: HeaderProps) {
  return (
    <div className="mb-6 mt-14 md:mt-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
          )}
        </div>
        {headerAction && (
          <div className="flex items-center gap-2 shrink-0">{headerAction}</div>
        )}
      </div>
    </div>
  );
}
