'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition, useEffect } from 'react';
import { Pagination } from './Pagination';

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  setIsPending: (value: boolean) => void;
}

export function PaginationWrapper({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  setIsPending,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();

  useEffect(() => {
    setIsPending(isNavigating);
  }, [isNavigating, setIsPending]);

  function pushPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handlePageChange(page: number) {
    pushPage(page);
  }

  function handlePrevious() {
    pushPage(currentPage - 1);
  }

  function handleNext() {
    pushPage(currentPage + 1);
  }

  function handleItemsPerPageChange(limit: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', String(limit));
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onItemsPerPageChange={handleItemsPerPageChange}
      onPrevious={handlePrevious}
      onNext={handleNext}
    />
  );
}
