'use client';

import * as React from 'react';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import { cn } from '@/infra/utils';

export interface FormTextareaProps extends React.ComponentProps<'textarea'> {
  label?: string;
  required?: boolean;
  error?: string | undefined;
  containerClassName?: string;
  control?: Control<any> | any;
  name?: string;
}

const FormTextareaInner = React.forwardRef<
  HTMLTextAreaElement,
  Omit<FormTextareaProps, 'control' | 'name'> & {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
      }
      >(function FormTextareaInnerComponent(
        {
          className,
          label,
          required,
          error,
          containerClassName,
          value,
          onChange,
          ...props
        },
        ref,
      ) {
        const inputId = React.useId();

        return (
          <div className={cn('w-full', containerClassName)}>
            {label && (
              <label
                htmlFor={inputId}
                className="mb-2 block text-sm font-semibold tracking-[-0.01em] text-foreground"
              >
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
              </label>
            )}
            <textarea
              id={inputId}
              ref={ref}
              value={value}
              onChange={onChange}
              className={cn(
                'w-full resize-y rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground transition-colors duration-200 placeholder:text-muted-foreground hover:border-primary/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50',
                error
                  ? 'border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/20'
                  : '',
                className,
              )}
              {...props}
            />
            {error && (
              <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
            )}
          </div>
        );
      });
FormTextareaInner.displayName = 'FormTextareaInner';

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ value, onChange, control, name, ...props }, ref) => {
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <FormTextareaInner
            value={String(field.value ?? '')}
            onChange={field.onChange}
            {...props}
            ref={ref}
          />
        )}
      />
    );
  }

  return (
    <FormTextareaInner
      value={String(value ?? '')}
      onChange={onChange ?? (() => {})}
      {...props}
      ref={ref}
    />
  );
});
FormTextarea.displayName = 'FormTextarea';
