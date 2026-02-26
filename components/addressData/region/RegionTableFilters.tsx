'use client';

import { Input } from '@/components/ui/input';

interface Props {
  search: string;
  handleSearch: (value: string) => void;
}

export function RegionTableFilters({ search, handleSearch }: Props) {
  return (
    <div className='relative flex flex-wrap items-center gap-3 p-4 border-b'>
      <Input
        placeholder='Qidiruv...'
        className='shadow-sm w-52 h-8 2xl:h-9 2xl:w-64'
        defaultValue={search}
        onChange={(e) => handleSearch(e.target.value)}
        autoFocus
        autoComplete='off'
      />
    </div>
  );
}
