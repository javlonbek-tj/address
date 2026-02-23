'use client';

import { DistrictFormDialog } from './';
import type { District, Region } from '@/types';
import {
  useTableActions,
  useDelete,
  useTableFilters,
  useDistrictTableData,
  useRegionsList,
} from '@/hooks';
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
import { useSearchParams } from 'next/navigation';

export function DistrictTable() {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const regionId = searchParams.get('regionId') || 'all';

  const { data: districtTableData, isLoadingDistrictTableData } =
    useDistrictTableData(page, limit, search, regionId);

  const { regions, isLoadingRegions } = useRegionsList();

  const {
    handleSearch,
    handleFilterChange,
    isLoading: isFilterLoading,
    setIsPending,
  } = useTableFilters();

  const {
    isFormOpen,
    handleCloseForm,
    editingItem,
    handleEdit,
    deleteId,
    setDeleteId,
    handleCloseDelete,
  } = useTableActions();

  const { isDeleting, handleDelete } = useDelete(deleteDistrict, {
    onSuccess: handleCloseDelete,
    successMessage: "Tuman muvaffaqiyatli o'chirildi",
    errorMessage: "Tumanni o'chirishda xatolik yuz berdi",
  });

  const districts = districtTableData?.data || [];
  const totalCount = districtTableData?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const isLoading =
    isLoadingDistrictTableData || isFilterLoading || isLoadingRegions;

  return (
    <div className='px-8 py-10'>
      <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg'>
        <div className='flex flex-wrap items-center gap-3 p-4 border-b'>
          <Input
            placeholder='Qidiruv...'
            className='shadow-sm w-52 h-8 2xl:h-9 2xl:w-64'
            defaultValue={search}
            onChange={(e) => handleSearch(e.target.value)}
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
        <DataTable
          data={districts}
          onEdit={handleEdit}
          onDelete={setDeleteId}
          isLoading={isLoading}
          pagination={{
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limit,
            setIsPending,
          }}
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
