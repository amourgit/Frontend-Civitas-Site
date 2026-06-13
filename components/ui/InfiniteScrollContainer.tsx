// components/ui/InfiniteScrollContainer.tsx
import React, { memo } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasNextPage: boolean;
  loading: boolean;
  error?: string | null;
  LoadingComponent?: React.ComponentType;
  ErrorComponent?: React.ComponentType<{ error: string; onRetry: () => void }>;
  EndComponent?: React.ComponentType;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-sm text-gray-600">Chargement...</span>
  </div>
);

const DefaultErrorComponent = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <p className="text-red-600 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Réessayer
    </button>
  </div>
);

const DefaultEndComponent = () => (
  <div className="flex items-center justify-center py-8">
    <span className="text-sm text-gray-500">Plus rien à charger</span>
  </div>
);

export const InfiniteScrollContainer = memo<InfiniteScrollContainerProps>(({
  children,
  onLoadMore,
  hasNextPage,
  loading,
  error,
  LoadingComponent = DefaultLoadingComponent,
  ErrorComponent = DefaultErrorComponent,
  EndComponent = DefaultEndComponent,
  className = '',
  threshold = 0.1,
  rootMargin = '100px'
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    onIntersect: (entry) => {
      if (entry.isIntersecting && hasNextPage && !loading && !error) {
        onLoadMore();
      }
    }
  });

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {/* Trigger element pour l'intersection observer */}
      <div ref={ref} className="h-1" />
      
      {/* États de chargement */}
      {loading && <LoadingComponent />}
      
      {error && (
        <ErrorComponent 
          error={error} 
          onRetry={() => {
            if (!loading) onLoadMore();
          }} 
        />
      )}
      
      {!hasNextPage && !loading && !error && <EndComponent />}
    </div>
  );
});

InfiniteScrollContainer.displayName = 'InfiniteScrollContainer';