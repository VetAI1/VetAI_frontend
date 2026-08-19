import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/infra/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-teal-600 dark:focus-visible:border-teal-500 focus-visible:ring-teal-600/30 dark:focus-visible:ring-teal-500/30 focus-visible:ring-[3px] aria-invalid:ring-red-600/20 dark:aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-600 dark:aria-invalid:border-red-500 active:scale-[0.98] motion-reduce:active:scale-100 motion-reduce:transition-none',
  {
    variants: {
      variant: {
        default:
          'bg-teal-800 dark:bg-teal-500 text-white dark:text-stone-950 shadow-[var(--shadow-brand)] hover:bg-teal-800/90 dark:hover:bg-teal-500/90',
        destructive:
          'bg-red-600 dark:bg-red-500 text-white hover:bg-red-600/90 dark:hover:bg-red-500/90 focus-visible:ring-red-600/20 dark:focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40 dark:bg-red-500/60',
        outline:
          'border border-stone-200 dark:border-stone-800 bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 shadow-sm hover:border-teal-800/35 dark:hover:border-teal-500/35 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-100 dark:bg-stone-700/30 dark:border-stone-700 dark:hover:bg-stone-700/50',
        secondary:
          'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 hover:bg-stone-100/80 dark:hover:bg-stone-800/80',
        ghost: 'hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-100 dark:hover:bg-amber-900/50',
        link: 'text-teal-800 dark:text-teal-500 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-11 px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
