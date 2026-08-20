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
          className={`flex min-h-11 w-full items-center gap-2 rounded-xl border bg-white dark:bg-stone-900 px-3 py-1.5 transition-colors duration-200 hover:border-teal-800/35 dark:hover:border-teal-500/35 ${error ? 'border-red-600 dark:border-red-500 bg-red-600/5 dark:bg-red-500/5 focus-within:border-red-600 dark:focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-600/20 dark:focus-within:ring-red-500/20' : 'border-stone-300 dark:border-stone-700 focus-within:border-teal-800 dark:focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-600/30 dark:focus-within:ring-teal-500/30'}`}
        >
          <Search size={16} className="shrink-0 text-stone-500 dark:text-stone-400" />
          {hasSelection && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selected.map((option) => (
                <span
                  key={option.id}
                  className="inline-flex h-7 max-w-48 items-center gap-1 rounded-lg bg-stone-100 dark:bg-stone-800 px-2 text-xs font-semibold text-stone-800 dark:text-stone-100"
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
                    className="shrink-0 text-teal-800 dark:text-teal-500 transition-colors hover:text-teal-800/70 dark:hover:text-teal-500/70"
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
              className="min-w-32 flex-1 bg-transparent py-1 text-sm text-stone-900 dark:text-stone-100 outline-none placeholder:text-stone-500 dark:placeholder:text-stone-400"
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
                className="max-h-48 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-[var(--shadow-card)]"
                hasMore={hasMorePage}
                loading={loadingMore}
                onLoadMore={() => onLoadNextPage?.()}
              >
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 size={16} className="animate-spin text-teal-800 dark:text-teal-500" />
                  </div>
                ) : items.length === 0 ? (
                  <p className="p-3 text-center text-sm text-stone-500 dark:text-stone-400">
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
                        className="h-auto w-full justify-between rounded-none border-b border-stone-200 dark:border-stone-800 px-3 py-2.5 text-sm text-stone-900 dark:text-stone-100 last:border-0 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-100"
                      >
                        <span className="flex flex-col text-left">
                          <span className="font-medium">{getOptionLabel(item)}</span>
                          {getOptionDescription?.(item) && (
                            <span className="text-xs text-stone-500 dark:text-stone-400">
                              {getOptionDescription(item)}
                            </span>
                          )}
                        </span>
                        {isSelected && <Check size={16} className="shrink-0 text-teal-800 dark:text-teal-500" />}
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
