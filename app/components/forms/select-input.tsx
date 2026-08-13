'use client';

import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { cn } from '@/infra/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string | undefined;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  compact?: boolean;
  control?: Control<any> | any;
  name?: string;
}

interface DropdownProps {
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  anchorRect: DOMRect;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

function Dropdown({
  options,
  value,
  onSelect,
  onClose,
  anchorRect,
  dropdownRef,
}: DropdownProps) {
  const MAX_HEIGHT = 260;
  const GAP = 4;
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const openUpward =
    spaceBelow < MAX_HEIGHT + GAP && anchorRect.top > MAX_HEIGHT + GAP;

  const style: React.CSSProperties = {
    position: 'fixed',
    left: anchorRect.left,
    width: anchorRect.width,
    zIndex: 9999,
    ...(openUpward
      ? { bottom: window.innerHeight - anchorRect.top + GAP }
      : { top: anchorRect.bottom + GAP }),
  };

  return (
    <div
      ref={dropdownRef}
      style={style}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="animate-in overflow-hidden rounded-xl border border-border bg-popover py-1.5 text-popover-foreground shadow-[var(--shadow-card)] fade-in-0 zoom-in-95 duration-150"
    >
      <div className="overflow-y-auto" style={{ maxHeight: MAX_HEIGHT }}>
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSelect(opt.value);
                onClose();
              }}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors',
                isSelected
                  ? 'bg-secondary text-secondary-foreground font-semibold'
                  : 'text-foreground hover:bg-muted',
              )}
            >
              <span>{opt.label}</span>
              {isSelected && (
                <Check size={14} className="shrink-0 text-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectInputInner({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  label,
  error,
  className,
  containerClassName,
  disabled,
  required,
  id,
  compact = false,
}: Omit<SelectInputProps, 'control' | 'name'> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!anchorRect) return;
    const close = (e: MouseEvent) => {
      const node = e.target as Node;
      if (
        !triggerRef.current?.contains(node) &&
        !dropdownRef.current?.contains(node)
      ) {
        setAnchorRect(null);
      }
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

  const toggle = () => {
    if (disabled) return;
    if (anchorRect) {
      setAnchorRect(null);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setAnchorRect(rect);
  };

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const open = anchorRect !== null;
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

      <div
        id={inputId}
        ref={triggerRef}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        className={cn(
          'flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-xl border border-input bg-card text-foreground transition-colors duration-200 hover:border-primary/35',
          compact ? 'px-2 py-1 text-xs' : 'px-3 py-2.5 text-sm',
          open
            ? 'border-primary ring-2 ring-ring/30'
            : error
              ? 'border-destructive bg-destructive/5'
              : '',
          disabled && 'opacity-60 cursor-not-allowed pointer-events-none',
          className,
        )}
      >
        <span
          className={cn(
            selectedLabel ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          size={compact ? 13 : 15}
          className={cn(
            'shrink-0 text-muted-foreground transition-transform duration-150',
            open && 'rotate-180 text-primary',
          )}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      )}

      {mounted &&
        open &&
        anchorRect &&
        createPortal(
          <Dropdown
            options={options}
            value={value}
            onSelect={onChange}
            onClose={() => setAnchorRect(null)}
            anchorRect={anchorRect}
            dropdownRef={dropdownRef}
          />,
          document.body,
        )}
    </div>
  );
}

export function SelectInput({
  value,
  onChange,
  control,
  name,
  ...rest
}: SelectInputProps) {
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({
          field,
        }: {
          field: { value: string; onChange: (value: string) => void };
        }) => (
          <SelectInputInner
            value={field.value ?? ''}
            onChange={field.onChange}
            {...rest}
          />
        )}
      />
    );
  }

  return (
    <SelectInputInner
      value={value ?? ''}
      onChange={onChange ?? (() => {})}
      {...rest}
    />
  );
}
