'use client';

import { Loader2Icon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IS_NEW_OPTIONS } from '@/lib';

interface Props {
  search: string;
  handleSearch: (value: string) => void;
  regionId: string;
  onRegionChange: (value: string) => void;
  regions: { id: string; name: string }[];
  districtId: string;
  onDistrictChange: (value: string) => void;
  districts: { id: string; name: string }[];
  isLoadingDistricts: boolean;
  mahallaId: string;
  onMahallaChange: (value: string) => void;
  mahallas: { id: string; name: string; code: string }[];
  isLoadingMahallas: boolean;
  streetId: string;
  handleFilterChange: (key: string, value: string) => void;
  streets: { id: string; name: string; code: string }[];
  isLoadingStreets: boolean;
  isNew: string;
  isRegionLocked?: boolean;
  isDistrictLocked?: boolean;
}

export function PropertyTableFilters({
  search,
  handleSearch,
  regionId,
  onRegionChange,
  regions,
  districtId,
  onDistrictChange,
  districts,
  isLoadingDistricts,
  mahallaId,
  onMahallaChange,
  mahallas,
  isLoadingMahallas,
  streetId,
  handleFilterChange,
  streets,
  isLoadingStreets,
  isNew,
  isRegionLocked = false,
  isDistrictLocked = false,
}: Props) {
  return (
    <div className='flex flex-wrap items-center gap-3 p-4 border-gray-100 dark:border-gray-700 border-b'>
      <Input
        placeholder='Qidiruv (kadastr)...'
        className='shadow-sm w-52 2xl:w-64 h-8 2xl:h-9'
        defaultValue={search}
        onChange={(e) => handleSearch(e.target.value)}
        autoFocus
        autoComplete='off'
      />

      {!isRegionLocked && !isDistrictLocked && (
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
            {regions.map((region) => (
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
      )}

      {!isDistrictLocked && (
        <Select
          value={districtId}
          onValueChange={onDistrictChange}
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
            {districts.map((district) => (
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
      )}

      <Select
        value={mahallaId}
        onValueChange={onMahallaChange}
        disabled={districtId === 'all' || isLoadingMahallas}
      >
        <SelectTrigger
          className='dark:bg-gray-700 shadow-sm w-52 dark:text-white'
          size='sm'
        >
          <SelectValue
            placeholder={
              isLoadingMahallas ? (
                <Loader2Icon className='animate-spin' />
              ) : (
                "Mahalla bo'yicha filter"
              )
            }
            className='text-xs 2xl:text-sm'
          />
        </SelectTrigger>
        <SelectContent className='dark:bg-gray-700 dark:text-white'>
          <SelectItem value='all' className='text-xs 2xl:text-sm'>
            Barcha mahallalar
          </SelectItem>
          {mahallas.map((mahalla) => (
            <SelectItem
              key={mahalla.id}
              value={mahalla.id}
              className='text-xs 2xl:text-sm'
            >
              {mahalla.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={streetId}
        onValueChange={(value) => handleFilterChange('streetId', value)}
        disabled={mahallaId === 'all' || isLoadingStreets}
      >
        <SelectTrigger
          className='dark:bg-gray-700 shadow-sm w-52 dark:text-white'
          size='sm'
        >
          <SelectValue
            placeholder={
              isLoadingStreets ? (
                <Loader2Icon className='animate-spin' />
              ) : (
                "Ko'cha bo'yicha filter"
              )
            }
            className='text-xs 2xl:text-sm'
          />
        </SelectTrigger>
        <SelectContent className='dark:bg-gray-700 dark:text-white'>
          <SelectItem value='all' className='text-xs 2xl:text-sm'>
            Barcha ko'chalar
          </SelectItem>
          {streets.map((street) => (
            <SelectItem
              key={street.id}
              value={street.id}
              className='text-xs 2xl:text-sm'
            >
              {street.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={isNew}
        onValueChange={(value) => handleFilterChange('isNew', value)}
      >
        <SelectTrigger
          className='dark:bg-gray-700 shadow-sm w-40 dark:text-white'
          size='sm'
        >
          <SelectValue
            placeholder='Yangi/Eski'
            className='text-xs 2xl:text-sm'
          />
        </SelectTrigger>
        <SelectContent className='dark:bg-gray-700 dark:text-white'>
          <SelectItem value='all' className='text-xs 2xl:text-sm'>
            Yangi/Eski
          </SelectItem>
          {IS_NEW_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.id}
              value={opt.id}
              className='text-xs 2xl:text-sm'
            >
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
