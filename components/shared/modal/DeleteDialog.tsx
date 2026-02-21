'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  showAlert?: boolean;
  alertDescription?: string;
  isDeleting?: boolean;
}

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  showAlert = false,
  alertDescription,
  isDeleting = false,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className='bg-white text-gray-900 dark:bg-gray-800 dark:text-white'>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className='dark:text-gray-400'>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className='cursor-pointer'>
            Bekor qilish
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className='bg-red-600 hover:bg-red-700 cursor-pointer'
          >
            {isDeleting ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              'O‘chirish'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
