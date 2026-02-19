import { useState } from 'react';

export function useTableActions<T>() {
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleCloseDelete = () => {
    setDeleteId(null);
  };

  return {
    // State
    editingItem,
    deleteId,
    isFormOpen,

    // Actions
    handleEdit,
    handleCreate,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,

    // Direct setters (if needed)
    setEditingItem,
    setDeleteId,
    setIsFormOpen,
  };
}
