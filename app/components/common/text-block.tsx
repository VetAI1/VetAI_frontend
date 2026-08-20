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
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {label}
        </span>
      </div>
      <p className="text-sm text-stone-900/80 dark:text-stone-100/80 leading-relaxed">
        {value}
      </p>
    </div>
  );
}
