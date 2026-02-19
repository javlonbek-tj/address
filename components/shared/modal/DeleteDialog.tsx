'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {showAlert && (
          <Alert variant='destructive' className='my-4'>
            <AlertCircle className='w-4 h-4' />
            <AlertTitle>Muhim!</AlertTitle>
            <AlertDescription>{alertDescription}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant='secondary'
            onClick={onClose}
            className='cursor-pointer min-w-25'
          >
            Отмена
          </Button>

          <Button
            variant='destructive'
            onClick={onConfirm}
            className='cursor-pointer min-w-25'
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              'O‘chirish'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
