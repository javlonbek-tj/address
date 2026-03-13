'use client';

import { Loader2Icon, Plus } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { District, Region } from '@/types';
import { Button } from '@/components/ui/button';
import {
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  USER_ROLES,
  USER_STATUSES,
} from '@/lib';

interface UserTableFiltersProps {
  search: string;
  handleSearch: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  regionId: string;
  onRegionChange: (value: string) => void;
  regions: Region[];
  isRegionLocked?: boolean;
  isDistrictLocked?: boolean;
  districtId: string;
  onDistrictChange: (value: string) => void;
  districts: District[];
  isLoadingDistricts?: boolean;
  onAddClick?: () => void;
}

export function UserTableFilters({
  search,
  handleSearch,
  role,
  onRoleChange,
  status,
  onStatusChange,
  regionId,
  onRegionChange,
  regions,
  isRegionLocked = false,
  isDistrictLocked = false,
  districtId,
  onDistrictChange,
  districts,
  isLoadingDistricts,
  onAddClick,
}: UserTableFiltersProps) {
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

      {!isRegionLocked && (
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
      )}

      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger
          className='dark:bg-gray-700 shadow-sm w-44 dark:text-white'
          size='sm'
        >
          <SelectValue
            placeholder='Rolni tanlang'
            className='text-xs 2xl:text-sm'
          />
        </SelectTrigger>
        <SelectContent className='dark:bg-gray-700 dark:text-white'>
          <SelectItem value='all' className='text-xs 2xl:text-sm'>
            Barcha rollar
          </SelectItem>
          {USER_ROLE_OPTIONS.map((opt) => (
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

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger
          className='dark:bg-gray-700 shadow-sm w-44 dark:text-white'
          size='sm'
        >
          <SelectValue placeholder='Holati' className='text-xs 2xl:text-sm' />
        </SelectTrigger>
        <SelectContent className='dark:bg-gray-700 dark:text-white'>
          <SelectItem value='all' className='text-xs 2xl:text-sm'>
            Barcha holatlar
          </SelectItem>
          {USER_STATUS_OPTIONS.map((opt) => (
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

      <div className='flex-1' />

      {onAddClick && (
      <Button
        onClick={onAddClick}
        size='sm'
        className='bg-blue-600 hover:bg-blue-700 cursor-pointer text-white gap-2'
      >
        <Plus className='w-4 h-4' />
        <span>Qo&apos;shish</span>
      </Button>
      )}
    </div>
  );
}
