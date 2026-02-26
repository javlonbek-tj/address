'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Region } from '@/types';

interface Props {
  search: string;
  handleSearch: (value: string) => void;
  regionId: string;
  handleFilterChange: (key: string, value: string) => void;
  regions: Region[];
}

export function DistrictTableFilters({
  search,
  handleSearch,
  regionId,
  handleFilterChange,
  regions,
}: Props) {
  return (
    <div className='flex flex-wrap items-center gap-3 p-4 border-b'>
      <Input
        placeholder='Qidiruv...'
        className='shadow-sm w-52 h-8 2xl:h-9 2xl:w-64'
        defaultValue={search}
        onChange={(e) => handleSearch(e.target.value)}
        autoFocus
        autoComplete='off'
      />
      <Select
        value={regionId}
        onValueChange={(value) => handleFilterChange('regionId', value)}
      >
        <SelectTrigger
          className='dark:bg-gray-700 shadow-sm w-52 dark:text-white'
          size='sm'
        >
          <SelectValue
            placeholder="Hudud bo'yicha filter"
            className='text-xs 2xl:text-sm'
          />
        </SelectTrigger>
        <SelectContent className='dark:bg-gray-700 dark:text-white'>
          <SelectItem value='all' className='text-xs 2xl:text-sm'>
            Barcha hududlar
          </SelectItem>
          {regions.map((region: Region) => (
            <SelectItem
              key={region.id}
              value={region.id}
              className='text-xs 2xl:text-sm'
            >
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
