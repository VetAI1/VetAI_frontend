'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  PaginatedQueryParams,
  PaginatedResponse,
} from '@/types/common';

interface UseAutoCompleteOptions<TItem, TFilters extends object> {
  fetcher: (
    params: PaginatedQueryParams<TFilters>,
  ) => Promise<PaginatedResponse<TItem>>;
  filters?: TFilters;
  pageSize?: number;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoComplete<
  TItem,
  TFilters extends object = Record<string, never>,
>({
  fetcher,
  filters,
  pageSize = 10,
  debounceMs = 300,
  enabled = true,
}: UseAutoCompleteOptions<TItem, TFilters>) {
  const [items, setItems] = useState<TItem[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePage, setHasMorePage] = useState(false);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      const requestId = ++requestIdRef.current;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetcher({
          ...(filters as TFilters),
          search: search || undefined,
          page: nextPage,
          size: pageSize,
        });

        if (requestId !== requestIdRef.current) return response;

        setItems((currentItems) =>
          append ? [...currentItems, ...response.data] : response.data,
        );
        setPage(response.meta.page);
        setHasMorePage(!response.meta.last);
        return response;
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [fetcher, filters, pageSize, search],
  );

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setItems([]);
      setHasMorePage(false);
      setLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchPage(1, false);
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [debounceMs, enabled, fetchPage]);

  const loadNextPage = useCallback(() => {
    if (!hasMorePage || loading || loadingMore) return;
    void fetchPage(page + 1, true);
  }, [fetchPage, hasMorePage, loading, loadingMore, page]);

  return {
    items,
    search,
    loading,
    loadingMore,
    hasMorePage,
    open,
    setOpen,
    setSearch,
    loadNextPage,
  };
}
