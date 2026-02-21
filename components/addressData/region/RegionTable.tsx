'use client';

import { RegionFormDialog } from './';
import type { Region } from '@/types';
import { useTableActions, useSearch, useDelete } from '@/hooks';
import { Input } from '@/components/ui/input';
import { DataTable } from '../table';
import { DeleteDialog } from '@/components/shared';
import { deleteRegion } from '@/app/actions';

interface Props {
  regions: Region[];
}

export function RegionTable({ regions }: Props) {
  const {
    isFormOpen,
    handleCloseForm,
    editingItem,
    handleEdit,
    deleteId,
    setDeleteId,
    handleCloseDelete,
  } = useTableActions();
  const { search, setSearch, filteredData } = useSearch(regions);

  const { isDeleting, handleDelete } = useDelete(deleteRegion, {
    onSuccess: handleCloseDelete,
    successMessage: "Hudud muvaffaqiyatli o'chirildi",
    errorMessage: "Hududni o'chirishda xatolik yuz berdi",
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
        </div>
        <DataTable
          data={filteredData}
          onEdit={handleEdit}
          onDelete={setDeleteId}
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
