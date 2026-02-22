'use client';

import { DistrictFormDialog } from './';
import type { District, Region } from '@/types';
import { useTableActions, useDelete, useTableFilters } from '@/hooks';
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
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  search: string;
  regionId: string;
}

export function DistrictTable({
  districts,
  regions,
  totalCount,
  currentPage,
  pageSize,
  totalPages,
  search,
  regionId,
}: Props) {
  const { handleSearch, handleFilterChange, isLoading, setIsPending } =
    useTableFilters();

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

  return (
    <div className="px-8 py-10">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b">
          <Input
            placeholder="Qidiruv..."
            className="shadow-sm w-52 h-8"
            defaultValue={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Select
            value={regionId}
            onValueChange={(value) => handleFilterChange('regionId', value)}
          >
            <SelectTrigger
              className="dark:bg-gray-700 shadow-sm w-52 dark:text-white"
              size="sm"
            >
              <SelectValue
                placeholder="Hudud bo'yicha filter"
                className="text-xs 3xl:text-sm"
              />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:text-white">
              <SelectItem value="all" className="text-xs 3xl:text-sm">
                Barcha hududlar
              </SelectItem>
              {regions.map((region) => (
                <SelectItem
                  key={region.id}
                  value={region.id}
                  className="text-xs 3xl:text-sm"
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
            currentPage,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: pageSize,
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
