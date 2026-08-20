'use client';

import { Check } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/infra/utils';

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: string;
  description?: string;
}

export function Checkbox({
  label,
  description,
  className,
  checked,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'flex items-start gap-3 text-sm',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      )}
    >
      <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked !== undefined ? (checked ?? false) : undefined}
          disabled={disabled}
          className={cn(
            'peer h-4 w-4 appearance-none rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 transition-colors checked:border-teal-800 dark:checked:border-teal-500 checked:bg-teal-800 dark:checked:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-600/30 dark:focus:ring-teal-500/30 disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
        <Check className="pointer-events-none absolute h-3 w-3 text-white dark:text-stone-950 opacity-0 peer-checked:opacity-100" />
      </span>
      {(label || description) && (
        <span>
          {label && (
            <span className="block font-medium text-stone-900 dark:text-stone-100">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
