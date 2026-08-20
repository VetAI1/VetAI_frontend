'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/infra/utils';

const SCREENS = [
  { id: 'dashboard', label: 'Visão geral', alt: 'Dashboard do VetAI' },
  { id: 'patients', label: 'Pacientes', alt: 'Tela de pacientes do VetAI' },
  { id: 'exams', label: 'Exames', alt: 'Tela de exames do VetAI' },
] as const;

type ScreenId = (typeof SCREENS)[number]['id'];

const AUTOPLAY_MS = 5000;

interface ProductShowcaseProps {
  initialScreen?: ScreenId;
  className?: string;
}

export function ProductShowcase({
  initialScreen = 'dashboard',
  className,
}: ProductShowcaseProps) {
  const { theme } = useTheme();
  const [activeScreen, setActiveScreen] = useState<ScreenId>(initialScreen);
  const [cycle, setCycle] = useState(0);
  const activeIndex = SCREENS.findIndex((screen) => screen.id === activeScreen);
  const currentScreen = SCREENS[activeIndex] ?? SCREENS[0];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const interval = window.setInterval(() => {
      setActiveScreen((current) => {
        const currentIndex = SCREENS.findIndex(
          (screen) => screen.id === current,
        );
        return SCREENS[(currentIndex + 1) % SCREENS.length]?.id ?? 'dashboard';
      });
      setCycle((value) => value + 1);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(interval);
  }, []);

  const selectScreen = (screenId: ScreenId) => {
    setActiveScreen(screenId);
    setCycle((value) => value + 1);
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-(--shadow-card) dark:border-stone-800 dark:bg-stone-900',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-stone-200 b g-stone-100/60 px-4 py-3 dark:border-stone-800 dark:bg-stone-800/60">
        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
          VetAI em uso
        </p>
        <span className="font-data text-[10px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-500">
          {currentScreen.label}
        </span>
      </div>
      <div className="relative aspect-16/10 overflow-hidden bg-stone-100 dark:bg-stone-800">
        <Image
          key={`${currentScreen.id}-${theme}-${cycle}`}
          src={`/screenshots/${currentScreen.id}-${theme}.webp`}
          alt={currentScreen.alt}
          fill
          className="animate-in object-cover object-top fade-in duration-500 [animation-timing-function:var(--ease-brand)]"
        />
      </div>
      <div className="flex gap-1.5 border-t border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
        {SCREENS.map((screen) => {
          const isActive = screen.id === activeScreen;
          return (
            <button
              key={screen.id}
              type="button"
              onClick={() => selectScreen(screen.id)}
              aria-label={`Exibir ${screen.label}`}
              aria-pressed={isActive}
              className="group flex-1 py-1"
            >
              <span
                className={cn(
                  'block h-1 overflow-hidden rounded-full transition-colors duration-200',
                  isActive
                    ? 'bg-teal-800/25 dark:bg-teal-500/25'
                    : 'bg-stone-200 group-hover:bg-stone-300 dark:bg-stone-800 dark:group-hover:bg-stone-700',
                )}
              >
                {isActive && (
                  <span
                    key={`progress-${currentScreen.id}-${cycle}`}
                    className="progress-fill block h-full w-full origin-left rounded-full bg-teal-800 dark:bg-teal-500 motion-reduce:bg-teal-800 motion-reduce:dark:bg-teal-500"
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
