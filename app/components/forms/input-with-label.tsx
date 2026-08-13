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
  Omit<InputWithLabelProps, 'control' | 'name'> & {
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

        return (
          <div className={cn('w-full', containerClassName)}>
            {label && (
              <div className="mb-2 flex items-center gap-2">
                <Label
                  {...(required ? { required } : {})}
                  className="text-sm font-semibold tracking-[-0.01em] text-foreground"
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
                          <Info className="h-4 w-4 cursor-help text-muted-foreground" />
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
                className={cn(
                  error &&
                    'border-destructive bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/20',
                  className,
                )}
                ref={ref}
                value={value ?? ''}
                onChange={onChange}
                {...props}
              />
              {endAdornment && (
                <div className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                  {endAdornment}
                </div>
              )}
            </div>
            {error && (
              <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
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
