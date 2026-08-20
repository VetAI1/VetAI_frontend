import { cn } from '@/infra/utils';

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  light?: boolean;
}

export function BrandLogo({
  className,
  compact = false,
  light = false,
}: BrandLogoProps) {
  const markClass = light
    ? 'bg-white/15 text-white ring-1 ring-white/20'
    : 'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950';
  const wordClass = light ? 'text-white' : 'text-stone-900 dark:text-stone-100';

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'grid size-9 place-items-center rounded-[13px] shadow-sm',
          markClass,
        )}
      >
        <svg viewBox="0 0 32 32" className="size-6 fill-none" aria-hidden="true">
          <path
            d="M16 28c-4.3 0-9-2.8-9-6.4 0-2.4 1.9-4.3 4.3-4.3 1.8 0 3.5.9 4.7 2.2 1.2-1.3 2.9-2.2 4.7-2.2 2.4 0 4.3 1.9 4.3 4.3C25 25.2 20.3 28 16 28Z"
            fill="currentColor"
          />
          <path
            d="M10.3 15.1c-1.7 0-3-1.8-3-4s1.3-4 3-4 3 1.8 3 4-1.3 4-3 4ZM21.7 15.1c-1.7 0-3-1.8-3-4s1.3-4 3-4 3 1.8 3 4-1.3 4-3 4ZM16 13.5c-1.8 0-3.2-1.9-3.2-4.2S14.2 5.1 16 5.1s3.2 1.9 3.2 4.2-1.4 4.2-3.2 4.2Z"
            fill="currentColor"
          />
          <path
            d="M16 20v5M13.5 22.5h5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className={cn('font-display text-xl font-bold tracking-[-0.06em]', wordClass)}>
          vet<span className={light ? 'text-amber-500 dark:text-amber-400' : 'text-teal-800 dark:text-teal-500'}>AI</span>
        </span>
      )}
    </div>
  );
}
