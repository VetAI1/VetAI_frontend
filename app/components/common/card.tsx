interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  shadow?: boolean;
}

export function Card({
  children,
  className = '',
  style,
  onClick,
  shadow = true,
}: CardProps) {
  return (
    <div
      className={`rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 ${shadow ? 'shadow-[var(--shadow-card)]' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
