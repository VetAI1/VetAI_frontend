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
                className="mb-2 block text-sm font-semibold tracking-[-0.01em] text-stone-900 dark:text-stone-100"
              >
                {label}
                {required && <span className="ml-0.5 text-red-600 dark:text-red-500">*</span>}
              </label>
            )}
            <textarea
              id={inputId}
              ref={ref}
              value={value}
              onChange={onChange}
              className={cn(
                'w-full resize-y rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 transition-colors duration-200 placeholder:text-stone-500 dark:placeholder:text-stone-400 hover:border-teal-800/35 dark:hover:border-teal-500/35 focus:border-teal-800 dark:focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-600/30 dark:focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50',
                error
                  ? 'border-red-600 dark:border-red-500 bg-red-600/5 dark:bg-red-500/5 focus:border-red-600 dark:focus:border-red-500 focus:ring-red-600/20 dark:focus:ring-red-500/20'
                  : '',
                className,
              )}
              {...props}
            />
            {error && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-500">{error}</p>
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
