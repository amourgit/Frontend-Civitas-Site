// hooks/useInfiniteScroll.ts
import { useState, useEffect, useRef, useCallback } from 'react';

export interface InfiniteScrollOptions {
  initialData?: any[];
  pageSize?: number;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export interface InfiniteScrollResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  loadMore: () => void;
  reset: () => void;
  currentPage: number;
  totalItems: number;
}

export function useInfiniteScroll<T = any>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>,
  options: InfiniteScrollOptions = {}
): InfiniteScrollResult<T> {
  const {
    initialData = [],
    pageSize = 20,
    threshold = 1.0,
    rootMargin = '100px',
    enabled = true
  } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!enabled || loading || !hasNextPage || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(currentPage, pageSize);
      
      setData(prev => [...prev, ...result.data]);
      setHasNextPage(result.hasMore);
      setCurrentPage(prev => prev + 1);
      
      if (result.total !== undefined) {
        setTotalItems(result.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [enabled, loading, hasNextPage, currentPage, pageSize, fetchFunction]);

  const reset = useCallback(() => {
    setData(initialData);
    setCurrentPage(0);
    setHasNextPage(true);
    setError(null);
    setLoading(false);
    setTotalItems(0);
    loadingRef.current = false;
  }, [initialData]);

  // Load initial data
  useEffect(() => {
    if (enabled && data.length === 0 && currentPage === 0) {
      loadMore();
    }
  }, [enabled, data.length, currentPage, loadMore]);

  return {
    data,
    loading,
    error,
    hasNextPage,
    loadMore,
    reset,
    currentPage,
    totalItems
  };
}