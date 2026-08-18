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
            'peer h-4 w-4 appearance-none rounded border border-input bg-card transition-colors checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
        <Check className="pointer-events-none absolute h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100" />
      </span>
      {(label || description) && (
        <span>
          {label && (
            <span className="block font-medium text-foreground">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
