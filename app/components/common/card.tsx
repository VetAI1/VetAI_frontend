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
      className={`rounded-lg border border-border bg-card ${shadow ? 'shadow-[var(--shadow-card)]' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
