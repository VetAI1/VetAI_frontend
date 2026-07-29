import type { ElementType } from 'react';

export interface ListSectionProps {
  icon: ElementType;
  label: string;
  items: string[];
  iconColor: string;
  bgColor: string;
}

export function ListSection({
  icon: Icon,
  label,
  items,
  iconColor,
  bgColor,
}: ListSectionProps) {
  if (!items || !items.length) return null;
  return (
    <div className={`rounded-xl border p-4 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className={iconColor} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
          >
            <span
              className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${iconColor.replace(
                'text-',
                'bg-',
              )}`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
