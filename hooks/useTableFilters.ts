'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export function useTableFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [isTransitioning, startTransition] = useTransition();

  const handleFilterChange = useCallback(
    (keyOrFilters: string | Record<string, string>, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (typeof keyOrFilters === 'string') {
        if (value && value !== 'all') {
          params.set(keyOrFilters, value);
        } else {
          params.delete(keyOrFilters);
        }
      } else {
        Object.entries(keyOrFilters).forEach(([key, val]) => {
          if (val && val !== 'all') {
            params.set(key, val);
          } else {
            params.delete(key);
          }
        });
      }

      params.set('page', '1');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams],
  );

  const handleSearch = useDebouncedCallback((value: string) => {
    handleFilterChange('search', value);
  }, 400);

  const isLoading = isTransitioning || isPending;

  return {
    handleSearch,
    handleFilterChange,
    isLoading,
    setIsPending,
  };
}
