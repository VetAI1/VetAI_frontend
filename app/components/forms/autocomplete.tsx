'use client';

import { Check, Loader2, Search, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { FieldShell } from './field-shell';

import { InfiniteScroll } from '@/app/components/common/infinite-scroll';
import { Button } from '@/components/ui/button';

export interface AutoCompleteOption {
  id: string;
  label?: string;
  description?: string | undefined;
}

interface AutoCompleteProps<TItem extends { id: string }> {
  label?: string;
  required?: boolean;
  placeholder: string;
  search: string;
  onSearchChange: (value: string) => void;
  items: TItem[];
  getOptionLabel: (item: TItem) => string;
  getOptionDescription?: (item: TItem) => string | undefined;
  loading?: boolean;
  loadingMore?: boolean;
  hasMorePage?: boolean;
  onLoadNextPage?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOption?: AutoCompleteOption | null;
  selectedOptions?: AutoCompleteOption[];
  multiple?: boolean;
  onSelect: (item: TItem) => void;
  onClear?: () => void;
  onRemove?: (option: AutoCompleteOption) => void;
  error?: string | undefined;
  emptyMessage?: string;
}

export function Autocomplete<TItem extends { id: string }>({
  label,
  required,
  placeholder,
  search,
  onSearchChange,
  items,
  getOptionLabel,
  getOptionDescription,
  loading = false,
  loadingMore = false,
  hasMorePage = false,
  onLoadNextPage,
  open,
  onOpenChange,
  selectedOption,
  selectedOptions = [],
  multiple = false,
  onSelect,
  onClear,
  onRemove,
  error,
  emptyMessage = 'Nenhum resultado encontrado',
}: AutoCompleteProps<TItem>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const selected = multiple
    ? selectedOptions
    : selectedOption
      ? [selectedOption]
      : [];
  const hasSelection = selected.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !popoverRef.current?.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const updateAnchorRect = () => {
      setAnchorRect(containerRef.current?.getBoundingClientRect() ?? null);
    };

    updateAnchorRect();
    window.addEventListener('resize', updateAnchorRect);
    window.addEventListener('scroll', updateAnchorRect, true);
    return () => {
      window.removeEventListener('resize', updateAnchorRect);
      window.removeEventListener('scroll', updateAnchorRect, true);
    };
  }, [open]);

  const openUpward =
    anchorRect !== null &&
    window.innerHeight - anchorRect.bottom < 208 &&
    anchorRect.top > 208;

  return (
    <FieldShell
      {...(label ? { label } : {})}
      {...(required ? { required } : {})}
      {...(error ? { error } : {})}
    >
      <div ref={containerRef} className="relative">
        <div
          className={`flex min-h-11 w-full items-center gap-2 rounded-xl border bg-card px-3 py-1.5 transition-colors duration-200 hover:border-primary/35 ${error ? 'border-destructive bg-destructive/5 focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20' : 'border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30'}`}
        >
          <Search size={16} className="shrink-0 text-muted-foreground" />
          {hasSelection && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selected.map((option) => (
                <span
                  key={option.id}
                  className="inline-flex h-7 max-w-48 items-center gap-1 rounded-lg bg-secondary px-2 text-xs font-semibold text-secondary-foreground"
                  title={option.description}
                >
                  <span className="truncate">{option.label}</span>
                  <button
                    type="button"
                    aria-label={`Remover ${option.label}`}
                    onClick={() => {
                      if (multiple) onRemove?.(option);
                      else onClear?.();
                    }}
                    className="shrink-0 text-primary transition-colors hover:text-primary/70"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {(!hasSelection || multiple) && (
            <input
              type="text"
              placeholder={placeholder}
              value={search ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => onOpenChange(true)}
              className="min-w-32 flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          )}
        </div>

        {mounted &&
          open &&
          anchorRect &&
          createPortal(
            <div
              ref={popoverRef}
              style={{
                position: 'fixed',
                top: openUpward ? undefined : anchorRect.bottom + 4,
                bottom: openUpward
                  ? window.innerHeight - anchorRect.top + 4
                  : undefined,
                left: anchorRect.left,
                width: anchorRect.width,
                zIndex: 9999,
              }}
            >
              <InfiniteScroll
                className="max-h-48 overflow-y-auto rounded-xl border border-border bg-popover shadow-[var(--shadow-card)]"
                hasMore={hasMorePage}
                loading={loadingMore}
                onLoadMore={() => onLoadNextPage?.()}
              >
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 size={16} className="animate-spin text-primary" />
                  </div>
                ) : items.length === 0 ? (
                  <p className="p-3 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </p>
                ) : (
                  items.map((item) => {
                    const isSelected = selected.some((option) => option.id === item.id);
                    return (
                      <Button
                        key={item.id}
                        type="button"
                        variant="ghost"
                        disabled={isSelected}
                        onClick={() => {
                          onSelect(item);
                          onSearchChange('');
                          if (!multiple) onOpenChange(false);
                        }}
                        className="h-auto w-full justify-between rounded-none border-b border-border px-3 py-2.5 text-sm text-foreground last:border-0 hover:bg-muted disabled:opacity-100"
                      >
                        <div className="text-left">
                          <p className="font-medium">{getOptionLabel(item)}</p>
                          {getOptionDescription?.(item) && (
                            <p className="text-xs text-muted-foreground">
                              {getOptionDescription(item)}
                            </p>
                          )}
                        </div>
                        {isSelected && <Check size={16} className="shrink-0 text-primary" />}
                      </Button>
                    );
                  })
                )}
              </InfiniteScroll>
            </div>,
            document.body,
          )}
      </div>
    </FieldShell>
  );
}
