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

export function DistrictFormDialog({ open, onClose, isEdit = false }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto overflow-x-hidden'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Tumanni tahrirlash' : 'Tuman qoʻshish'}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {isEdit ? 'Tumanni tahrirlash' : 'Tuman qoʻshish'}
        </DialogDescription>
        <h1>hello</h1>
      </DialogContent>
    </Dialog>
  );
}
