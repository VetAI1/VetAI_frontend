'use client';

import { Progress } from '@/components/ui/progress';

interface HeaderProps {
  title: string;
  usedGB?: number;
  totalGB?: number;
  showStorage?: boolean;
  headerAction?: React.ReactNode;
}

export function Header({
  title,
  usedGB = 0,
  totalGB = 0,
  showStorage = true,
  headerAction,
}: HeaderProps) {
  const percentage = (usedGB / totalGB) * 100;

  return (
    <div className="mb-8 mt-16 md:mt-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex justify-between items-center w-full md:w-auto">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-[-0.04em] text-foreground">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {headerAction}
          {showStorage && (
            <div className="flex flex-col gap-1 w-full md:w-[30%]">
              <span className="whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 font-medium text-center">
                {usedGB}GB de {totalGB}GB usados
              </span>
              <Progress value={percentage} className="h-2.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
