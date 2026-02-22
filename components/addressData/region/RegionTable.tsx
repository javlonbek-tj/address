'use client';

import { RegionFormDialog } from './';
import type { Region } from '@/types';
import { useTableActions, useDelete, useTableFilters } from '@/hooks';
import { Input } from '@/components/ui/input';
import { DataTable } from '../table';
import { DeleteDialog } from '@/components/shared';
import { deleteRegion } from '@/app/actions';

interface Props {
  // ... existing props
  regions: Region[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  search: string;
  totalPages: number;
}

export function RegionTable({
  regions,
  totalCount,
  currentPage,
  pageSize,
  search,
  totalPages,
}: Props) {
  const {
    isFormOpen,
    handleCloseForm,
    editingItem,
    handleEdit,
    deleteId,
    setDeleteId,
    handleCloseDelete,
  } = useTableActions();

  const { isDeleting, handleDelete } = useDelete(deleteRegion, {
    onSuccess: handleCloseDelete,
    successMessage: "Hudud muvaffaqiyatli o'chirildi",
    errorMessage: "Hududni o'chirishda xatolik yuz berdi",
  });

  const { handleSearch, isLoading, setIsPending } = useTableFilters();

  return (
    <div className="p-8">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg transition-opacity duration-200">
        <div className="relative flex flex-wrap items-center gap-3 p-4 border-b">
          <Input
            placeholder="Qidiruv..."
            className="shadow-sm w-52 h-8"
            defaultValue={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <DataTable
          data={regions}
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
