type BadgeColor =
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'neutral'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
}

const COLORS: Record<BadgeColor, string> = {
  red: 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-500',
  green: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-500',
  yellow: 'bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-400',
  blue: 'bg-sky-50 dark:bg-sky-900 text-sky-700 dark:text-sky-500',
  neutral: 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400',
  danger: 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-500',
  success: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-500',
  warning: 'bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-400',
  info: 'bg-sky-50 dark:bg-sky-900 text-sky-700 dark:text-sky-500',
};

export const Badge = ({ children, color = 'danger' }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${COLORS[color]}`}
    >
      {children}
    </span>
  );
};
