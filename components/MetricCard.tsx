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

type Tone = 'primary' | 'sun' | 'success' | 'info' | 'danger';

const toneClasses: Record<Tone, string> = {
  primary: 'bg-teal-800/10 dark:bg-teal-500/10 text-teal-800 dark:text-teal-500',
  sun: 'bg-amber-500/20 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300',
  success: 'bg-emerald-700/10 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500',
  info: 'bg-sky-700/10 dark:bg-sky-500/10 text-sky-700 dark:text-sky-500',
  danger: 'bg-red-600/10 dark:bg-red-500/10 text-red-600 dark:text-red-500',
};

interface MetricCardProps {
  // Sem `icon`, o card fica só com título e valor.
  icon?: keyof typeof iconsMap;
  color?: string;
  tone?: Tone;
  title: string;
  value: string | number;
  tooltip?: string;
  loading?: boolean;
  className?: string;
}

export function MetricCard({
  icon,
  color,
  tone = 'primary',
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
        'rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 transition-colors hover:border-teal-800/25 dark:hover:border-teal-500/25',
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
                <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                  {title}
                </span>
                {tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-stone-500/60 dark:text-stone-400/60 hover:text-stone-500 dark:hover:text-stone-400 transition-colors" />
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
            <p className="font-data mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              {value}
            </p>
          )}
        </div>

        {IconComponent && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-md',
              !color && toneClasses[tone],
            )}
            style={
              color
                ? { backgroundColor: `${color}1f`, color }
                : undefined
            }
          >
            {loading ? (
              <Skeleton className="h-11 w-11 rounded-md" />
            ) : (
              <IconComponent size={20} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
