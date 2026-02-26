'use client';

import { RegionFormDialog, RegionTableFilters } from './';
import type { Region } from '@/types';
import {
  useTableActions,
  useDelete,
  useTableFilters,
  useRegionTableData,
} from '@/hooks';
import { DataTable } from '../table';
import { DeleteDialog } from '@/components/shared';
import { deleteRegion } from '@/app/actions';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export function RegionTable() {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';

  const { data, isLoadingRegionTableData } = useRegionTableData(
    page,
    limit,
    search,
  );

  const {
    isFormOpen,
    handleCloseForm,
    editingItem,
    handleEdit,
    deleteId,
    setDeleteId,
    handleCloseDelete,
  } = useTableActions();

  const queryClient = useQueryClient();
  const { isDeleting, handleDelete } = useDelete(deleteRegion, {
    onSuccess: () => {
      handleCloseDelete();
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      queryClient.invalidateQueries({ queryKey: ['regions-table-data'] });
    },
    successMessage: "Hudud muvaffaqiyatli o'chirildi",
    errorMessage: "Hududni o'chirishda xatolik yuz berdi",
  });

  const {
    handleSearch,
    isLoading: isFilterLoading,
    setIsPending,
  } = useTableFilters();

  const regions = data?.data || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);
  const isLoading = isFilterLoading || isLoadingRegionTableData;

  return (
    <div className='p-8'>
      <div className='bg-white dark:bg-gray-800 shadow-sm rounded-lg transition-opacity duration-200'>
        <RegionTableFilters search={search} handleSearch={handleSearch} />
        <DataTable
          data={regions}
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

      <RegionFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        region={editingItem as Region}
      />
      <DeleteDialog
        open={!!deleteId}
        onClose={handleCloseDelete}
        onConfirm={() => handleDelete(deleteId!)}
        isDeleting={isDeleting}
        title="Ushbu hududni o'chirishni xohlaysizmi?"
        description="Hududga tegishli barcha ma'lumotlar o'chiriladi."
      />
    </div>
  );
}
