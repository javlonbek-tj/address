'use client';

import { RegionFormDialog } from '.';
import type { Region } from '@/types';
import { useTableActions } from '@/hooks/useTableActions';
import { DataTable } from './DataTable';

interface Props {
  regions: Region[];
}

export function RegionTable({ regions }: Props) {
  const { isFormOpen, handleCloseForm, editingItem, handleEdit, setDeleteId } =
    useTableActions();

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
        <div className="p-6 overflow-x-auto">
          <DataTable
            data={regions}
            onEdit={handleEdit}
            onDelete={setDeleteId}
          />
        </div>
      </div>
      <RegionFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        region={editingItem as Region}
      />
    </div>
  );
}
