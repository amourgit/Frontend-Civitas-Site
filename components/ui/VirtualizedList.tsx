// components/ui/VirtualizedList.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  LoadingComponent?: React.ComponentType;
  EmptyComponent?: React.ComponentType;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  loading = false,
  LoadingComponent,
  EmptyComponent
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const getItemHeight = useCallback(
    (index: number): number => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight]
  );

  const { totalHeight, startIndex, endIndex, offsetY } = useMemo(() => {
    const itemCount = items.length;
    
    if (itemCount === 0) {
      return { totalHeight: 0, startIndex: 0, endIndex: 0, offsetY: 0 };
    }

    let totalHeight = 0;
    const itemHeights: number[] = [];
    
    for (let i = 0; i < itemCount; i++) {
      const height = getItemHeight(i);
      itemHeights.push(height);
      totalHeight += height;
    }

    let startIndex = 0;
    let accumulatedHeight = 0;
    
    for (let i = 0; i < itemCount; i++) {
      if (accumulatedHeight + itemHeights[i] >= scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += itemHeights[i];
    }

    let endIndex = startIndex;
    let visibleHeight = 0;
    
    for (let i = startIndex; i < itemCount; i++) {
      visibleHeight += itemHeights[i];
      endIndex = i;
      if (visibleHeight >= containerHeight) {
        endIndex = Math.min(itemCount - 1, i + overscan);
        break;
      }
    }

    let offsetY = 0;
    for (let i = 0; i < startIndex; i++) {
      offsetY += itemHeights[i];
    }

    return { totalHeight, startIndex, endIndex, offsetY };
  }, [items.length, scrollTop, containerHeight, overscan, getItemHeight]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, startIndex, endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  }, [onScroll]);

  if (items.length === 0 && !loading) {
    return EmptyComponent ? <EmptyComponent /> : null;
  }

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ height: getItemHeight(index) }}
              className="w-full"
            >
              {renderItem(item, index)}
            </div>
          ))}
          {loading && LoadingComponent && <LoadingComponent />}
        </div>
      </div>
    </div>
  );
}