'use client';

import { Info } from 'lucide-react';
import * as React from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/infra/utils';

export interface InputWithLabelProps<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  tooltip?: string;
  error?: string | undefined;
  containerClassName?: string;
  endAdornment?: React.ReactNode;
  control?: Control<TFieldValues>;
  name?: Path<TFieldValues>;
}

const InputWithLabelInner = React.forwardRef<
  HTMLInputElement,
  Omit<InputWithLabelProps, 'control'> & {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      }
      >(function InputWithLabelInnerComponent(
        {
          className,
          label,
          required,
          tooltip,
          error,
          containerClassName,
          endAdornment,
          value,
          onChange,
          ...props
        },
        ref,
      ) {
        const [open, setOpen] = React.useState(false);
        const generatedId = React.useId();
        const inputId = props.id ?? generatedId;

        return (
          <div className={cn('w-full', containerClassName)}>
            {label && (
              <div className="mb-2 flex items-center gap-2">
                <Label
                  htmlFor={inputId}
                  {...(required ? { required } : {})}
                  className="text-sm font-semibold tracking-[-0.01em] text-stone-900 dark:text-stone-100"
                >
                  {label}
                </Label>
                {tooltip && (
                  <TooltipProvider>
                    <Tooltip open={open} onOpenChange={setOpen}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex"
                          onClick={() => setOpen(!open)}
                          onMouseEnter={() => setOpen(true)}
                          onMouseLeave={() => setOpen(false)}
                        >
                          <Info className="h-4 w-4 cursor-help text-stone-500 dark:text-stone-400" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
            <div className="relative">
              <Input
                id={inputId}
                className={cn(
                  error &&
                    'border-red-600 dark:border-red-500 bg-red-600/5 dark:bg-red-500/5 focus-visible:border-red-600 dark:focus-visible:border-red-500 focus-visible:ring-red-600/20 dark:focus-visible:ring-red-500/20',
                  className,
                )}
                ref={ref}
                value={value ?? ''}
                onChange={onChange}
                {...props}
              />
              {endAdornment && (
                <div className="absolute inset-y-0 right-3 flex items-center text-stone-500 dark:text-stone-400">
                  {endAdornment}
                </div>
              )}
            </div>
            {error && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-500">{error}</p>
            )}
          </div>
        );
      });
InputWithLabelInner.displayName = 'InputWithLabelInner';

const InputWithLabel = React.forwardRef(
  <TFieldValues extends FieldValues>(
    {
      value,
      onChange,
      control,
      name,
      ...props
    }: InputWithLabelProps<TFieldValues>,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    if (control && name) {
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <InputWithLabelInner
              {...(name ? { name } : {})}
              value={field.value ?? ''}
              onChange={(event) => {
                field.onChange(event);
                onChange?.(event);
              }}
              {...props}
              ref={ref}
            />
          )}
        />
      );
    }

    return (
      <InputWithLabelInner
        {...(name ? { name } : {})}
        value={value ?? ''}
        onChange={onChange ?? (() => {})}
        {...props}
        ref={ref}
      />
    );
  },
) as <TFieldValues extends FieldValues>(
  props: InputWithLabelProps<TFieldValues> & {
    ref?: React.Ref<HTMLInputElement>;
  },
) => React.ReactElement | null;

export { InputWithLabel };
