import type { ElementType } from 'react';

export interface InfoCardProps {
  icon: ElementType;
  label: string;
  value: string | undefined;
  iconColor: string;
}

export function InfoCard({
  icon: Icon,
  label,
  value,
  iconColor,
}: InfoCardProps) {
  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <Icon size={14} className={iconColor} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {value || (
          <span className="text-slate-400 dark:text-slate-500 font-normal">
            —
          </span>
        )}
      </p>
    </div>
  );
}
