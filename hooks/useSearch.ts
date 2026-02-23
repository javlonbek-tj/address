'use client';

import { useMemo, useState } from 'react';

interface BaseEntity {
  name: string;
  code: number;
}

export function useSearch<T extends BaseEntity>(data: T[]) {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const query = search.toLowerCase().trim();
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.code.toString().includes(query),
    );
  }, [data, search]);

  return {
    search,
    setSearch,
    filteredData,
  };
}
