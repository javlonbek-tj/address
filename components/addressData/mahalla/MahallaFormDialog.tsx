import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Mahalla } from '@/lib/generated/prisma/client';

interface Props {
  open: boolean;
  onClose: () => void;
  mahalla: Mahalla | null;
}

export function MahallaFormDialog({ open, onClose, mahalla }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white dark:bg-gray-800 sm:max-w-lg max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white'>
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
