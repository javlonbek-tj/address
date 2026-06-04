'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Pencil, Loader2 } from 'lucide-react';
import { updateStreetUzKadCode } from '@/app/actions';

interface InlineUzKadCodeCellProps {
  streetId: string;
  initialValue: string | null;
}

export function InlineUzKadCodeCell({
  streetId,
  initialValue,
}: InlineUzKadCodeCellProps) {
  const [value, setValue] = useState(initialValue || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const originalValue = useRef(initialValue || '');
  const queryClient = useQueryClient();

  const startEditing = () => {
    originalValue.current = value;
    setIsEditing(true);
  };

  const save = async () => {
    if (value === originalValue.current) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    const result = await updateStreetUzKadCode(streetId, value || null);
    setIsSaving(false);
    if (result.success) {
      originalValue.current = value;
      queryClient.invalidateQueries({ queryKey: ['streets-table'] });
    } else {
      toast.error(result.message || "Saqlashda xatolik yuz berdi");
      setValue(originalValue.current);
    }
    setIsEditing(false);
  };

  const cancel = () => {
    setValue(originalValue.current);
    setIsEditing(false);
  };

  return (
    <div className='flex items-center h-6 w-36'>
      {isEditing ? (
        <>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancel();
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            disabled={isSaving}
            className='h-full w-full px-2 text-xs font-mono border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50'
          />
          {isSaving && (
            <Loader2 className='ml-1 w-3 h-3 animate-spin text-blue-500 shrink-0' />
          )}
        </>
      ) : (
        <div
          onClick={startEditing}
          className='group/edit flex items-center gap-1.5 h-full w-full px-2 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors'
        >
          <span
            className={`text-xs font-mono truncate ${value ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500 italic'}`}
          >
            {value || '—'}
          </span>
          <Pencil className='w-3 h-3 opacity-0 group-hover/edit:opacity-60 text-blue-500 shrink-0 transition-opacity' />
        </div>
      )}
    </div>
  );
}
