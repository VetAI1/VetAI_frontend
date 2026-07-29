import type { ElementType } from 'react';

export interface TextBlockProps {
  icon: ElementType;
  label: string;
  value: string | undefined;
  iconColor: string;
  borderColor: string;
  bgColor: string;
}

export function TextBlock({
  icon: Icon,
  label,
  value,
  iconColor,
  borderColor,
  bgColor,
}: TextBlockProps) {
  if (!value) return null;
  return (
    <div className={`rounded-xl border p-4 ${borderColor} ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={iconColor} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {value}
      </p>
    </div>
  );
}
