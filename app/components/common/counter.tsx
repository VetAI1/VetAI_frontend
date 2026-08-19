'use client';

import { useEffect, useRef, useState } from 'react';

import { useReveal } from '@/hooks/use-reveal';

interface CounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function Counter({
  target,
  duration = 300,
  suffix = '',
  prefix = '',
}: CounterProps) {
  const { ref, isVisible, prefersReducedMotion } = useReveal();
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, target, duration, prefersReducedMotion]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
}
