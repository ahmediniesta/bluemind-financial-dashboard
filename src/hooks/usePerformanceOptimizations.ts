/**
 * Enterprise-grade performance optimization hooks
 * Provides memoization, debouncing, throttling, and other performance utilities
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Debounce hook for expensive operations
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for high-frequency events
export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now();
      if (now - lastExecuted.current >= delay) {
        setThrottledValue(value);
        lastExecuted.current = now;
      }
    }, delay - (Date.now() - lastExecuted.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
};

// Memoized calculation hook with cache invalidation
export const useMemoizedCalculation = <T, P extends readonly unknown[]>(
  calculation: (...args: P) => T,
  dependencies: P,
  maxCacheSize: number = 100
): T => {
  const cache = useRef<Map<string, T>>(new Map());
  
  return useMemo(() => {
    const key = JSON.stringify(dependencies);
    
    if (cache.current.has(key)) {
      const cachedResult = cache.current.get(key);
      if (cachedResult !== undefined) {
        return cachedResult;
      }
    }
    
    const result = calculation(...dependencies);
    
    // Implement LRU cache eviction
    if (cache.current.size >= maxCacheSize) {
      const firstKey = cache.current.keys().next().value;
      if (firstKey !== undefined) {
        cache.current.delete(firstKey);
      }
    }
    
    cache.current.set(key, result);
    return result;
  }, dependencies);
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);
  const updateTimes = useRef<number[]>([]);

  useEffect(() => {
    mountTime.current = performance.now();
    renderCount.current = 0;
  }, []);

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    
    if (renderCount.current > 1) {
      updateTimes.current.push(now);
      
      // Keep only last 10 render times
      if (updateTimes.current.length > 10) {
        updateTimes.current.shift();
      }
    }
  });

  const getPerformanceStats = useCallback(() => {
    const totalTime = performance.now() - mountTime.current;
    const avgUpdateTime = updateTimes.current.length > 0 
      ? updateTimes.current.reduce((a, b) => a + b) / updateTimes.current.length 
      : 0;

    return {
      componentName: componentName || 'Unknown',
      renderCount: renderCount.current,
      totalTime,
      avgUpdateTime,
      lastRenderTime: updateTimes.current[updateTimes.current.length - 1] || 0
    };
  }, [componentName]);

  // Log performance stats in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const stats = getPerformanceStats();
      if (stats.renderCount > 5) {
        console.warn(`🐌 Performance Warning: ${componentName} has rendered ${stats.renderCount} times`);
      }
    }
  });

  return getPerformanceStats;
};

// Virtual scrolling hook for large lists
export const useVirtualScrolling = <T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  buffer: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex + 1),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, scrollTop, containerHeight, itemHeight, buffer]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    containerRef,
    visibleItems,
    handleScroll
  };
};

// Async operation hook with caching and error handling
export const useAsyncOperation = <T>(
  operation: () => Promise<T>,
  dependencies: React.DependencyList,
  options: {
    cacheKey?: string;
    enableCache?: boolean;
    retryCount?: number;
    retryDelay?: number;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef<Map<string, T>>(new Map());
  const { cacheKey, enableCache = true, retryCount = 3, retryDelay = 1000 } = options;

  const executeOperation = useCallback(async () => {
    const key = cacheKey || JSON.stringify(dependencies);
    
    if (enableCache && cache.current.has(key)) {
      setData(cache.current.get(key)!);
      return;
    }

    setLoading(true);
    setError(null);

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const result = await operation();
        
        if (enableCache) {
          cache.current.set(key, result);
        }
        
        setData(result);
        setError(null);
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        
        if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    if (lastError) {
      setError(lastError);
    }
    
    setLoading(false);
  }, [operation, dependencies, cacheKey, enableCache, retryCount, retryDelay]);

  useEffect(() => {
    executeOperation();
  }, [executeOperation]);

  const retry = useCallback(() => {
    executeOperation();
  }, [executeOperation]);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { data, loading, error, retry, clearCache };
};

// Memory usage monitoring hook
export const useMemoryMonitor = (interval: number = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    usagePercentage: number;
  } | null>(null);

  useEffect(() => {
    const checkMemory = () => {
      // @ts-ignore - performance.memory is available in Chrome
      if (performance.memory) {
        // @ts-ignore
        const memory = performance.memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        });
      }
    };

    checkMemory();
    const intervalId = setInterval(checkMemory, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryInfo;
};

// Component lazy loading with suspense
export const useLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ComponentType = () => React.createElement('div', {}, 'Loading...')
) => {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    importFunc()
      .then(module => {
        if (isMounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [importFunc]);

  return { Component, loading, error, fallback };
};

// Optimized search hook with debouncing and filtering
export const useOptimizedSearch = <T>(
  items: T[],
  searchFields: (keyof T)[],
  debounceMs: number = 300
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = items.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return typeof value === 'string' && value.toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [items, debouncedSearchTerm, searchFields, sortBy, sortOrder]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, endIndex);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  const handleSort = useCallback((field: keyof T) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  }, [sortBy]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    setItemsPerPage,
    filteredAndSortedItems,
    paginatedItems,
    totalPages,
    totalItems: filteredAndSortedItems.length,
    handleSort,
    handlePageChange
  };
};