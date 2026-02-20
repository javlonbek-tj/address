import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import type { Street } from '@/lib/generated/prisma/client';

interface Props {
  open: boolean;
  onClose: () => void;
  street: Street | null;
}

export function StreetFormDialog({ open, onClose, street }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto overflow-x-hidden'>
        <DialogHeader>
          <DialogTitle>
            {street ? "Ko'chani tahrirlash" : "Ko'cha qo'shish"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {street ? "Ko'chani tahrirlash" : "Ko'cha qo'shish"}
        </DialogDescription>
        <h1>hello</h1>
      </DialogContent>
    </Dialog>
  );
}
