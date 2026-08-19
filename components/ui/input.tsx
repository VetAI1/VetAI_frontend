import * as React from 'react';

import { cn } from '@/infra/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, value, ...props }, ref) => {
    const safeValue = value !== undefined ? (value ?? '') : undefined;
    return (
      <input
        type={type}
        {...(safeValue !== undefined ? { value: safeValue } : {})}
        className={cn(
          'w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 transition-colors duration-150 placeholder:text-stone-500 dark:placeholder:text-stone-400 hover:border-teal-800/35 dark:hover:border-teal-500/35 focus:border-teal-800 dark:focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-600/30 dark:focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
