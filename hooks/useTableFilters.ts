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
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
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
