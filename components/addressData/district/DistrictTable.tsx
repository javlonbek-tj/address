'use client';

import { useMemo, useState } from 'react';
import { DistrictFormDialog } from './';
import type { District, Region } from '@/types';
import { useTableActions, useSearch, useDelete } from '@/hooks';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '../table';
import { DeleteDialog } from '@/components/shared';
import { deleteDistrict } from '@/app/actions';

interface Props {
  districts: District[];
  regions: Region[];
}

export function DistrictTable({ districts, regions }: Props) {
  const {
    isFormOpen,
    handleCloseForm,
    editingItem,
    handleEdit,
    deleteId,
    setDeleteId,
    handleCloseDelete,
  } = useTableActions();
  const [selectedRegionId, setSelectedRegionId] = useState<string>('all');
  const {
    search,
    setSearch,
    filteredData: searchedData,
  } = useSearch(districts);

  const filteredData = useMemo(() => {
    if (selectedRegionId === 'all') return searchedData;
    return searchedData.filter((d) => d.regionId === selectedRegionId);
  }, [searchedData, selectedRegionId]);

  const { isDeleting, handleDelete } = useDelete(deleteDistrict, {
    onSuccess: handleCloseDelete,
    successMessage: "Tuman muvaffaqiyatli o'chirildi",
    errorMessage: "Tumanni o'chirishda xatolik yuz berdi",
  });

  return (
    <div className='px-8 py-10 overflow-hidden'>
      <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg'>
        <div className='flex flex-wrap items-center gap-3 border-b p-4'>
          <Input
            placeholder='Qidiruv...'
            className='w-64 shadow-sm'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={selectedRegionId} onValueChange={setSelectedRegionId}>
            <SelectTrigger className='w-64 shadow-sm dark:bg-gray-700 dark:text-white'>
              <SelectValue placeholder="Hudud bo'yicha filter" />
            </SelectTrigger>
            <SelectContent className='dark:bg-gray-700 dark:text-white'>
              <SelectItem value='all'>Barcha hududlar</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DataTable
          data={filteredData}
          onEdit={handleEdit}
          onDelete={setDeleteId}
        />
      </div>
      <DistrictFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        district={editingItem as District}
        regions={regions}
      />

      <DeleteDialog
        open={!!deleteId}
        onClose={handleCloseDelete}
        onConfirm={() => handleDelete(deleteId!)}
        isDeleting={isDeleting}
        title="Ushbu tumanni o'chirishni xohlaysizmi?"
        description="Tumanga tegishli barcha ma'lumotlar o'chiriladi."
      />
    </div>
  );
}
