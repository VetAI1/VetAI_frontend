'use client';

import { useReveal } from '@/hooks/use-reveal';
import { cn } from '@/infra/utils';

interface TextRevealProps {
  text: string;
  className?: string;
}

export function TextReveal({ text, className }: TextRevealProps) {
  const { ref, isVisible, prefersReducedMotion } = useReveal({
    threshold: 0.25,
  });

  return (
    <span ref={ref} aria-label={text} className={cn('inline', className)}>
      <span aria-hidden="true">
        {text.split(' ').map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={cn(
              'inline-block transition-[opacity,transform] duration-500 [transition-timing-function:var(--ease-brand)] motion-reduce:translate-y-0 motion-reduce:transition-none',
              isVisible || prefersReducedMotion
                ? 'translate-y-0 opacity-100'
                : 'translate-y-3 opacity-0',
            )}
            style={{ transitionDelay: `${prefersReducedMotion ? 0 : index * 35}ms` }}
          >
            {word}
            {index < text.split(' ').length - 1 ? '\u00a0' : ''}
          </span>
        ))}
      </span>
    </span>
  );
}
