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
    <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-100/30 dark:bg-stone-800/30">
      <div className="flex items-center gap-2">
        <Icon size={14} className={iconColor} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
        {value || (
          <span className="text-stone-500 dark:text-stone-400 font-normal">
            —
          </span>
        )}
      </p>
    </div>
  );
}
