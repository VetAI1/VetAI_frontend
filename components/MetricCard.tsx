'use client';

import {
  Users,
  MailPlus,
  PawPrint,
  Microscope,
  MessagesSquare,
  ClipboardList,
  Calendar,
  Stethoscope,
  HelpCircle,
} from 'lucide-react';
import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/infra/utils';

const iconsMap = {
  Users,
  MailPlus,
  PawPrint,
  Microscope,
  MessagesSquare,
  ClipboardList,
  Calendar,
  Stethoscope,
};

interface MetricCardProps {
  // Sem `icon`, o card fica só com título e valor.
  icon?: keyof typeof iconsMap;
  color?: string;
  title: string;
  value: string | number;
  tooltip?: string;
  loading?: boolean;
  className?: string;
}

export function MetricCard({
  icon,
  color,
  title,
  value,
  tooltip,
  loading = false,
  className,
}: MetricCardProps) {
  const IconComponent = icon ? iconsMap[icon] : null;

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition-colors hover:border-teal-300 dark:hover:border-teal-700',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {loading ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {title}
                </span>
                {tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-500 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <p className="max-w-[200px] leading-relaxed">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
          </div>

          {loading ? (
            <Skeleton className="h-9 w-24 mt-2" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
          )}
        </div>

        {IconComponent && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: !loading ? `${color}1f` : undefined,
              color: !loading ? color : 'transparent',
            }}
          >
            {loading ? (
              <Skeleton className="h-11 w-11 rounded-lg" />
            ) : (
              <IconComponent size={20} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
