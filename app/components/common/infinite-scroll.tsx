'use client';

import { Loader2 } from 'lucide-react';
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';

interface InfiniteScrollProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hasMore: boolean;
  loading?: boolean;
  onLoadMore: () => void;
}

export function InfiniteScroll({
  children,
  className,
  style,
  hasMore,
  loading = false,
  onLoadMore,
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const container = containerRef.current;
    const sentinel = sentinelRef.current;

    if (!container || !sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onLoadMoreRef.current();
      },
      { root: container, rootMargin: '32px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className="flex min-h-10 items-center justify-center">
          {loading && <Loader2 size={16} className="animate-spin text-stone-500 dark:text-stone-400" />}
        </div>
      )}
    </div>
  );
}
