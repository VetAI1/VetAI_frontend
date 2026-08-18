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
  red: 'bg-danger-soft text-danger',
  green: 'bg-success-soft text-success',
  yellow: 'bg-warning-soft text-warning',
  blue: 'bg-info-soft text-info',
  neutral: 'bg-muted text-muted-foreground',
  danger: 'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
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
