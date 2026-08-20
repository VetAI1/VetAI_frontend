'use client';

import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { EmptyState } from '@/app/components/common/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  headers?: string[];
  children?: ReactNode;
  columns?: DataTableColumn<T>[];
  data?: T[];
  getRowKey?: (row: T, index: number) => string;
  emptyState?: ReactNode;
  loading?: boolean;
  skeletonRows?: number;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  centerHeaders?: boolean;
  columnWidths?: string[];
  className?: string;
  tableClassName?: string;
  fillHeight?: boolean;
  maxBodyHeight?: number;
  responsive?: boolean;
}

export function DataTable<T>({
  headers,
  children,
  columns,
  data,
  getRowKey,
  emptyState = <EmptyState />,
  loading = false,
  skeletonRows = 5,
  showSearch = false,
  onSearch,
  searchPlaceholder = 'Buscar...',
  actions,
  centerHeaders = false,
  columnWidths,
  className,
  tableClassName,
  fillHeight = false,
  maxBodyHeight,
  responsive = true,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const tableHeaders = columns?.map((column) => column.header) ?? headers ?? [];
  const colSpan = Math.max(tableHeaders.length, 1);
  const stretchEmptyState =
    fillHeight && !loading && columns !== undefined && data?.length === 0;

  const useColumnsMode = columns !== undefined && data !== undefined;
  const showCards = responsive && useColumnsMode && columns.length > 0;
  const renderedEmptyState =
    typeof emptyState === 'string' ? <EmptyState title={emptyState} /> : emptyState;

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const renderTable = (
    <div
      className="flex-1 overflow-x-auto overflow-y-auto rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
      style={maxBodyHeight ? { maxHeight: maxBodyHeight } : undefined}
    >
      <table
        className={`w-full text-left text-sm${stretchEmptyState ? ' h-full' : ''}${tableClassName ? ` ${tableClassName}` : ''}`}
      >
        <thead className="border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-800/70 text-stone-500 dark:text-stone-400">
          <tr>
            {tableHeaders.map((header, index) => {
              const column = columns?.[index];
              const align = column?.align;

              return (
                <th
                  key={index}
                  className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider ${centerHeaders || align === 'center' ? 'text-center' : ''} ${align === 'right' || (!centerHeaders && !align && index === tableHeaders.length - 1) ? 'text-right' : ''}`}
                  style={
                    column?.width || columnWidths?.[index]
                      ? { width: column?.width ?? columnWidths?.[index] }
                      : undefined
                  }
                >
                  {header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-stone-200/60 dark:border-stone-800/60">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, rIdx) => (
              <tr key={`skel-row-${rIdx}`}>
                {tableHeaders.length > 0 ? (
                  tableHeaders.map((_, cIdx) => (
                    <td key={`skel-cell-${cIdx}`} className="p-4">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  ))
                ) : (
                  <td className="p-4">
                    <Skeleton className="h-5 w-full" />
                  </td>
                )}
              </tr>
            ))
          ) : useColumnsMode ? (
            data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={getRowKey?.(row, rowIndex) ?? rowIndex}
                  className="transition-colors hover:bg-stone-100/40 dark:hover:bg-stone-800/40"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3.5 ${column.align === 'center' ? 'text-center' : ''} ${column.align === 'right' ? 'text-right' : ''}`}
                    >
                      {column.render?.(row, rowIndex) ??
                        String(
                          (row as Record<string, unknown>)[column.key] ?? '',
                        )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={colSpan}
                  className="p-5"
                >
                  {renderedEmptyState}
                </td>
              </tr>
            )
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );

  const renderMobileCards = showCards && (
    <div className="flex flex-col gap-3 md:hidden">
      {loading ? (
        Array.from({ length: skeletonRows }).map((_, rIdx) => (
          <div
            key={`skel-card-${rIdx}`}
            className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-[var(--shadow-card)]"
          >
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))
      ) : data.length > 0 ? (
        data.map((row, rowIndex) => (
          <div
            key={getRowKey?.(row, rowIndex) ?? rowIndex}
            className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-col gap-2.5">
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    {column.header}
                  </span>
                  <span className="text-right text-sm">
                    {column.render?.(row, rowIndex) ??
                      String(
                        (row as Record<string, unknown>)[column.key] ?? '',
                      )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="md:hidden">
          {renderedEmptyState}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`flex flex-col min-h-0${fillHeight ? ' flex-1' : ''}${className ? ` ${className}` : ''}`}
    >
      {(showSearch || actions) && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {actions && <div>{actions}</div>}
          {showSearch && (
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500/70 dark:text-stone-400/70"
                size={16}
              />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 py-2 pl-9 pr-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-500 dark:placeholder:text-stone-400 transition-colors hover:border-teal-800/35 dark:hover:border-teal-500/35 focus:border-teal-800 dark:focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-600/30 dark:focus:ring-teal-500/30"
              />
            </div>
          )}
        </div>
      )}

      <div className={showCards ? 'hidden md:block' : 'block'}>{renderTable}</div>
      {renderMobileCards}
    </div>
  );
}
