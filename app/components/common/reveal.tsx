'use client';

import { useReveal } from '@/hooks/use-reveal';
import { cn } from '@/infra/utils';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
}

const directionStyles: Record<Direction, string> = {
  up: 'translate-y-4',
  down: '-translate-y-4',
  left: 'translate-x-4',
  right: '-translate-x-4',
  none: '',
};

export function Reveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 300,
}: RevealProps) {
  const { ref, isVisible, prefersReducedMotion } = useReveal();

  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] motion-reduce:transition-none',
        isVisible
          ? 'opacity-100 translate-x-0 translate-y-0'
          : `opacity-0 ${directionStyles[direction]}`,
        className,
      )}
      style={{
        transitionDuration: `${prefersReducedMotion ? 0 : duration}ms`,
        transitionDelay: `${prefersReducedMotion ? 0 : delay}ms`,
        transitionTimingFunction: 'var(--ease-brand)',
      }}
    >
      {children}
    </div>
  );
}
