import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import type { Mahalla } from '@/lib/generated/prisma/client';

interface Props {
  open: boolean;
  onClose: () => void;
  mahalla: Mahalla | null;
}

export function MahallaFormDialog({ open, onClose, mahalla }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto overflow-x-hidden'>
        <DialogHeader>
          <DialogTitle>
            {mahalla ? 'Mahallani tahrirlash' : 'Mahalla qoʻshish'}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {mahalla ? 'Mahallani tahrirlash' : 'Mahalla qoʻshish'}
        </DialogDescription>
        <h1>hello</h1>
      </DialogContent>
    </Dialog>
  );
}
