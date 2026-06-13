// utils/performance.ts
import React from 'react';

/**
 * Debounce function pour limiter les appels répétés
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * Throttle function pour limiter la fréquence des appels
   */
  export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
  
  /**
   * Hook pour mesurer les performances de rendu
   */
  export function usePerformanceMonitor(name: string) {
    if (process.env.NODE_ENV === 'development') {
      console.time(`Render: ${name}`);
      
      return () => {
        console.timeEnd(`Render: ${name}`);
      };
    }
    
    return () => {};
  }
  
  /**
   * Lazy loader d'images avec IntersectionObserver
   */
  export class LazyImageLoader {
    private static observer: IntersectionObserver | null = null;
    private static imageQueue = new Set<HTMLImageElement>();
  
    static init() {
      if (typeof window === 'undefined' || this.observer) return;
  
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;
              
              if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                this.observer?.unobserve(img);
                this.imageQueue.delete(img);
              }
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      );
    }
  
    static observe(img: HTMLImageElement) {
      if (!this.observer) this.init();
      
      this.imageQueue.add(img);
      this.observer?.observe(img);
    }
  
    static cleanup() {
      this.imageQueue.forEach(img => {
        this.observer?.unobserve(img);
      });
      this.imageQueue.clear();
      this.observer?.disconnect();
      this.observer = null;
    }
  }
  
  /**
   * Cache LRU (Least Recently Used) pour optimiser la mémoire
   */
  export class LRUCache<K, V> {
    private capacity: number;
    private cache = new Map<K, V>();
  
    constructor(capacity: number) {
      this.capacity = capacity;
    }
  
    get(key: K): V | undefined {
      if (this.cache.has(key)) {
        // Déplace l'élément à la fin (plus récent)
        const value = this.cache.get(key)!;
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
      }
      return undefined;
    }
  
    set(key: K, value: V): void {
      if (this.cache.has(key)) {
        this.cache.delete(key);
      } else if (this.cache.size >= this.capacity) {
        // Supprime le plus ancien élément
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      this.cache.set(key, value);
    }
  
    clear(): void {
      this.cache.clear();
    }
  
    size(): number {
      return this.cache.size;
    }
  }
  
  /**
   * Batch processor pour grouper les opérations
   */
  export class BatchProcessor<T> {
    private queue: T[] = [];
    private timer: NodeJS.Timeout | null = null;
    private processor: (items: T[]) => void;
    private delay: number;
  
    constructor(processor: (items: T[]) => void, delay: number = 100) {
      this.processor = processor;
      this.delay = delay;
    }
  
    add(item: T): void {
      this.queue.push(item);
      
      if (this.timer) {
        clearTimeout(this.timer);
      }
      
      this.timer = setTimeout(() => {
        this.flush();
      }, this.delay);
    }
  
    flush(): void {
      if (this.queue.length > 0) {
        const items = [...this.queue];
        this.queue = [];
        this.processor(items);
      }
      
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  }
  
  /**
   * Utility pour optimiser les re-renders
   */
  export const createMemoizedSelector = <T, R>(
    selector: (state: T) => R,
    equalityFn: (a: R, b: R) => boolean = (a, b) => a === b
  ) => {
    let lastArgs: T;
    let lastResult: R;
    
    return (state: T): R => {
      if (lastArgs !== state) {
        const newResult = selector(state);
        
        if (!equalityFn(lastResult, newResult)) {
          lastResult = newResult;
        }
        
        lastArgs = state;
      }
      
      return lastResult;
    };
  };
  
  /**
   * Hook pour détecter les changements de taille de viewport
   */
  export function useViewportSize() {
    const [size, setSize] = React.useState({
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });
  
    React.useEffect(() => {
      const updateSize = throttle(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
  
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }, []);
  
    return size;
  }