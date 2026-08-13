'use client';

import { Clock } from 'lucide-react';
import * as React from 'react';
import { Controller, type Control, type FieldValues } from 'react-hook-form';

import { cn } from '@/infra/utils';

export interface TimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string | undefined;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  // Faixa de horas aceita — usada pela agenda para limitar ao horário de
  // funcionamento da clínica.
  minHour?: number;
  maxHour?: number;
  className?: string;
  containerClassName?: string;
  id?: string;
  control?: Control<FieldValues>;
  name?: string;
}

function formatDigits(digits: string): string {
  const d = digits.slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// Só devolve valor quando os 4 dígitos foram digitados; parciais viram ''
// para o formulário tratar como não preenchido.
function displayToValue(
  display: string,
  minHour: number,
  maxHour: number,
): string {
  const digits = display.replace(/\D/g, '');
  if (digits.length < 4) return '';
  const h = clamp(parseInt(digits.slice(0, 2), 10), minHour, maxHour);
  const m = clamp(parseInt(digits.slice(2, 4), 10), 0, 59);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function nowTime(minHour: number, maxHour: number): string {
  const now = new Date();
  const h = clamp(now.getHours(), minHour, maxHour);
  return `${String(h).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function TimeInputInner({
  value,
  onChange,
  label,
  error,
  placeholder = 'hh:mm',
  required,
  disabled,
  minHour = 0,
  maxHour = 23,
  className,
  containerClassName,
  id,
}: Omit<TimeInputProps, 'control' | 'name'> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const [display, setDisplay] = React.useState(value);

  React.useEffect(() => {
    setDisplay(value);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDigits(event.target.value.replace(/\D/g, ''));
    setDisplay(formatted);
    onChange(displayToValue(formatted, minHour, maxHour));
  };

  // Normaliza o que ficou na tela ao sair do campo: "9" vira "09:00" e
  // "25:70" vira "23:59", em vez de deixar um valor pela metade visível.
  const handleBlur = () => {
    const digits = display.replace(/\D/g, '');
    if (!digits) {
      setDisplay('');
      onChange('');
      return;
    }
    const padded = digits.padEnd(4, '0');
    const normalized = displayToValue(padded, minHour, maxHour);
    setDisplay(normalized);
    onChange(normalized);
  };

  const setNow = () => {
    if (disabled) return;
    const current = nowTime(minHour, maxHour);
    setDisplay(current);
    onChange(current);
  };

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

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
      <div className="relative">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={5}
          disabled={disabled}
          className={cn(
            'w-full rounded-xl border border-input bg-card px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 hover:border-primary/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30',
            error
              ? 'border-destructive bg-destructive/5 focus:border-destructive focus:ring-destructive/20'
              : '',
            disabled && 'opacity-60 cursor-not-allowed',
            className,
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={setNow}
          disabled={disabled}
          title="Usar o horário atual"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed"
        >
          <Clock size={15} />
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

export function TimeInput({
  value,
  onChange,
  control,
  name,
  ...rest
}: TimeInputProps) {
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TimeInputInner
            value={field.value ?? ''}
            onChange={field.onChange}
            {...rest}
          />
        )}
      />
    );
  }

  return (
    <TimeInputInner
      value={value ?? ''}
      onChange={onChange ?? (() => {})}
      {...rest}
    />
  );
}
