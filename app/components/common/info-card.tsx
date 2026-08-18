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
    <div className="flex flex-col gap-1.5 p-4 rounded-lg border border-border bg-muted/30">
      <div className="flex items-center gap-2">
        <Icon size={14} className={iconColor} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground">
        {value || (
          <span className="text-muted-foreground font-normal">
            —
          </span>
        )}
      </p>
    </div>
  );
}
