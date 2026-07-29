'use client';

import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { FieldShell } from './field-shell';

import { InfiniteScroll } from '@/app/components/common/infinite-scroll';
import { Button } from '@/components/ui/button';

export interface AutoCompleteOption {
  id: string;
  label: string;
  description?: string | undefined;
}

interface AutoCompleteProps<TItem extends { id: string }> {
  label: string;
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
  selectedOption: AutoCompleteOption | null;
  onSelect: (item: TItem) => void;
  onClear: () => void;
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
  onSelect,
  onClear,
  error,
  emptyMessage = 'Nenhum resultado encontrado',
}: AutoCompleteProps<TItem>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  return (
    <FieldShell label={label} required={required} error={error}>
      {selectedOption ? (
        <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-700 dark:bg-teal-900/20">
          <div>
            <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
              {selectedOption.label}
            </p>
            {selectedOption.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedOption.description}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            className="text-teal-600 hover:text-teal-800 dark:text-teal-400"
          >
            <X size={14} />
          </Button>
        </div>
      ) : (
        <div ref={containerRef} className="relative">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={placeholder}
              value={search ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => onOpenChange(true)}
              className={`w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white ${error ? 'border-red-400 focus:ring-red-500 dark:border-red-500' : 'border-slate-200 focus:ring-teal-500 dark:border-slate-600'}`}
            />
          </div>

          {open && (
            <InfiniteScroll
              className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700"
              hasMore={hasMorePage}
              loading={loadingMore}
              onLoadMore={() => onLoadNextPage?.()}
            >
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 size={16} className="animate-spin text-teal-600" />
                </div>
              ) : items.length === 0 ? (
                <p className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
                  {emptyMessage}
                </p>
              ) : (
                items.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      onSelect(item);
                      onOpenChange(false);
                    }}
                    className="h-auto w-full justify-start rounded-none border-b border-slate-100 px-3 py-2.5 text-sm text-slate-900 last:border-0 dark:border-slate-600 dark:text-white"
                  >
                    <div className="text-left">
                      <p className="font-medium">{getOptionLabel(item)}</p>
                      {getOptionDescription?.(item) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {getOptionDescription(item)}
                        </p>
                      )}
                    </div>
                  </Button>
                ))
              )}
            </InfiniteScroll>
          )}
        </div>
      )}
    </FieldShell>
  );
}
