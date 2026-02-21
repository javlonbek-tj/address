import { useState } from 'react';
import toast from 'react-hot-toast';
import { ActionResult } from '@/types';

interface UseDeleteOptions {
  onSuccess: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useDelete<T>(
  deleteAction: (id: string) => Promise<ActionResult<T>>,
  {
    onSuccess,
    successMessage = 'Успешно удалено',
    errorMessage = 'Ошибка при удалении',
  }: UseDeleteOptions,
) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteAction(id);
      if (result.success) {
        toast.success(successMessage);
        onSuccess();
      } else {
        toast.error(result.message || errorMessage);
      }
    } catch (error) {
      console.error('[USE_DELETE_ERROR]', error);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return { isDeleting, handleDelete };
}
