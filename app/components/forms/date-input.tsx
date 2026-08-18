'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import type { Control, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { cn } from '@/infra/utils';

export interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string | undefined;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  control?: Control<FieldValues>;
  name?: string;
}

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function isoToDisplay(iso: string): string {
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function formatDigits(digits: string): string {
  const d = digits.slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function displayToIso(display: string): string {
  const digits = display.replace(/\D/g, '');
  if (digits.length < 8) return '';
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10);
  const y = parseInt(yyyy, 10);
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900) return '';
  return `${yyyy}-${mm}-${dd}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface CalendarDropdownProps {
  value: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
  anchorRect: DOMRect;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

function CalendarDropdown({
  value,
  onSelect,
  onClose,
  anchorRect,
  dropdownRef,
}: CalendarDropdownProps) {
  const CALENDAR_HEIGHT = 300;
  const GAP = 6;
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const openUpward =
    spaceBelow < CALENDAR_HEIGHT + GAP &&
    anchorRect.top > CALENDAR_HEIGHT + GAP;

  const style: React.CSSProperties = {
    position: 'fixed',
    left: anchorRect.left,
    width: Math.max(anchorRect.width, 288),
    zIndex: 9999,
    ...(openUpward
      ? { bottom: window.innerHeight - anchorRect.top + GAP }
      : { top: anchorRect.bottom + GAP }),
  };
  const today = new Date();
  const initial = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = React.useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(initial.getMonth());

  const selectedParts = value
    ? {
      y: parseInt(value.slice(0, 4)),
      m: parseInt(value.slice(5, 7)) - 1,
      d: parseInt(value.slice(8, 10)),
    }
    : null;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const handleDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onSelect(`${viewYear}-${mm}-${dd}`);
    onClose();
  };

  const goToToday = () => {
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    onSelect(`${today.getFullYear()}-${mm}-${dd}`);
    onClose();
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div
      ref={dropdownRef}
      style={style}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="animate-in rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-[var(--shadow-card)] fade-in-0 zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="select-none text-sm font-semibold text-foreground">
          {MONTHS[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            className="select-none py-1 text-center text-[11px] font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();

          const isSelected =
            selectedParts !== null &&
            day === selectedParts.d &&
            viewMonth === selectedParts.m &&
            viewYear === selectedParts.y;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDay(day)}
              className={cn(
                'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-100 select-none',
                isSelected
                  ? 'bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-brand)]'
                  : isToday
                    ? 'bg-secondary text-secondary-foreground font-semibold ring-1 ring-primary/35'
                    : 'text-foreground hover:bg-secondary hover:text-secondary-foreground',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
        <button
          type="button"
          onClick={() => {
            onSelect('');
            onClose();
          }}
          className="px-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Limpar
        </button>
        <button
          type="button"
          onClick={goToToday}
          className="px-1 text-xs font-semibold text-primary transition-colors hover:text-primary/70"
        >
          Hoje
        </button>
      </div>
    </div>
  );
}

function DateInputInner({
  value,
  onChange,
  label,
  error,
  placeholder = 'dd/mm/aaaa',
  className,
  containerClassName,
  required,
  disabled,
  id,
}: Omit<DateInputProps, 'control' | 'name'> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const [display, setDisplay] = React.useState(() => isoToDisplay(value));
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    setDisplay(isoToDisplay(value));
  }, [value]);

  React.useEffect(() => {
    if (!anchorRect) return;
    const close = (e: MouseEvent) => {
      const node = e.target as Node;
      const insideContainer = containerRef.current?.contains(node);
      const insideDropdown = dropdownRef.current?.contains(node);
      if (!insideContainer && !insideDropdown) setAnchorRect(null);
    };
    const closeOnScroll = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setAnchorRect(null);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', closeOnScroll, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', closeOnScroll, true);
    };
  }, [anchorRect]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const formatted = formatDigits(digits);
    setDisplay(formatted);
    onChange(displayToIso(formatted));
  };

  const handleSelect = (iso: string) => {
    onChange(iso);
    setDisplay(isoToDisplay(iso));
  };

  const toggleCalendar = () => {
    if (disabled) return;
    if (anchorRect) {
      setAnchorRect(null);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setAnchorRect(rect);
  };

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const open = anchorRect !== null;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold tracking-[-0.01em] text-foreground"
        >
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative" ref={containerRef}>
        <input
          id={inputId}
          type="text"
          value={display}
          onChange={handleTextChange}
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          className={cn(
            'w-full rounded-md border border-input bg-card px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 hover:border-primary/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30',
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
          onClick={toggleCalendar}
          disabled={disabled}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 transition-colors disabled:cursor-not-allowed',
            open
              ? 'text-primary'
              : 'text-muted-foreground hover:text-primary',
          )}
        >
          <Calendar size={15} />
        </button>
      </div>

      {mounted &&
        open &&
        anchorRect &&
        createPortal(
          <CalendarDropdown
            value={value}
            onSelect={handleSelect}
            onClose={() => setAnchorRect(null)}
            anchorRect={anchorRect}
            dropdownRef={dropdownRef}
          />,
          document.body,
        )}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

export function DateInput({
  value,
  onChange,
  control,
  name,
  ...rest
}: DateInputProps) {
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DateInputInner
            value={field.value ?? ''}
            onChange={field.onChange}
            {...rest}
          />
        )}
      />
    );
  }

  return (
    <DateInputInner
      value={value ?? ''}
      onChange={onChange ?? (() => {})}
      {...rest}
    />
  );
}
