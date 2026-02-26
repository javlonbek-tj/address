'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2Icon } from 'lucide-react';
import type { District, Region } from '@/types';

interface Props {
  search: string;
  handleSearch: (value: string) => void;
  regionId: string;
  onRegionChange: (value: string) => void;
  regions: Region[];
  districtId: string;
  handleFilterChange: (key: string, value: string) => void;
  districts: District[];
  isLoadingDistricts: boolean;
  isOptimized: string;
}

export function MahallaTableFilters({
  search,
  handleSearch,
  regionId,
  onRegionChange,
  regions,
  districtId,
  handleFilterChange,
  districts,
  isLoadingDistricts,
  isOptimized,
}: Props) {
  return (
    <div className='flex flex-wrap items-center gap-3 p-4 border-gray-100 dark:border-gray-700 border-b'>
      <Input
        placeholder='Qidiruv...'
        className='shadow-sm w-52 2xl:w-64 h-8 2xl:h-9'
        defaultValue={search}
        onChange={(e) => handleSearch(e.target.value)}
        autoFocus
        autoComplete='off'
      />

      <Select value={regionId} onValueChange={onRegionChange}>
        <SelectTrigger
          className='dark:bg-gray-700 shadow-sm w-52 dark:text-white'
          size='sm'
        >
          <SelectValue
            placeholder="Viloyat bo'yicha filter"
            className='text-xs 2xl:text-sm'
          />
        </SelectTrigger>
        <SelectContent className='dark:bg-gray-700 dark:text-white'>
          <SelectItem value='all' className='text-xs 2xl:text-sm'>
            Barcha viloyatlar
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

      <Select
        value={districtId}
        onValueChange={(value) => handleFilterChange('districtId', value)}
        disabled={regionId === 'all' || isLoadingDistricts}
      >
        <SelectTrigger
          className='dark:bg-gray-700 shadow-sm w-52 dark:text-white'
          size='sm'
        >
          <SelectValue
            placeholder={
              isLoadingDistricts ? (
                <Loader2Icon className='animate-spin' />
              ) : (
                "Tuman bo'yicha filter"
              )
            }
            className='text-xs 2xl:text-sm'
          />
        </SelectTrigger>
        <SelectContent className='dark:bg-gray-700 dark:text-white'>
          <SelectItem value='all' className='text-xs 2xl:text-sm'>
            Barcha tumanlar
          </SelectItem>
          {districts.map((district: District) => (
            <SelectItem
              key={district.id}
              value={district.id}
              className='text-xs 2xl:text-sm'
            >
              {district.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={isOptimized}
        onValueChange={(value) => handleFilterChange('isOptimized', value)}
      >
        <SelectTrigger
          className='dark:bg-gray-700 shadow-sm w-44 dark:text-white'
          size='sm'
        >
          <SelectValue placeholder='Holati' className='text-xs 2xl:text-sm' />
        </SelectTrigger>
        <SelectContent className='dark:bg-gray-700 dark:text-white'>
          <SelectItem value='all' className='text-xs 2xl:text-sm'>
            Holati
          </SelectItem>
          <SelectItem value='true' className='text-xs 2xl:text-sm'>
            Optimallashgan
          </SelectItem>
          <SelectItem value='false' className='text-xs 2xl:text-sm'>
            Optimallashmagan
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
