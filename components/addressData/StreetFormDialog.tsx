import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  isEdit: boolean;
}

export function StreetFormDialog({ open, onClose, isEdit = false }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto overflow-x-hidden'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Ko'chani tahrirlash" : "Ko'cha qo'shish"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {isEdit ? "Ko'chani tahrirlash" : "Ko'cha qo'shish"}
        </DialogDescription>
        <h1>hello</h1>
      </DialogContent>
    </Dialog>
  );
}
