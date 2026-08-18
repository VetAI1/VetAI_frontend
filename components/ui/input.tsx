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
          'w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground transition-colors duration-150 placeholder:text-muted-foreground hover:border-primary/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
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
