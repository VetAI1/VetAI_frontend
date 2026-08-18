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
  primary: 'bg-primary/10 text-primary',
  sun: 'bg-brand-sun/20 text-brand-sun-strong',
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
  danger: 'bg-danger/10 text-danger',
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
        'rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/25',
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
                <span className="text-sm font-medium text-muted-foreground">
                  {title}
                </span>
                {tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
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
            <p className="font-data mt-2 text-3xl font-semibold tracking-tight text-foreground">
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
