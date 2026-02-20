import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  isEditing?: boolean;
  isPending?: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  editText?: string;
  createText?: string;
  showLoader?: boolean;
  className?: string;
}

export function FormActions({
  isEditing = false,
  isPending = false,
  isLoading = false,
  onCancel,
  submitText,
  cancelText = 'Bekor qilish',
  editText = 'Tahrirlash',
  createText = "Qo'shish",
  showLoader = true,
  className = '',
}: FormActionsProps) {
  const disabled = isPending || isLoading;
  const buttonText = submitText || (isEditing ? editText : createText);

  return (
    <div className={`flex justify-end gap-2 pt-4 ${className}`}>
      <Button
        type='button'
        variant='outline'
        onClick={onCancel}
        disabled={disabled}
        className={`cursor-pointer min-w-25 transition-colors ${
          disabled ? 'opacity-70 cursor-default' : ''
        }`}
      >
        {cancelText}
      </Button>

      <Button
        type='submit'
        disabled={disabled}
        className='cursor-pointer min-w-25'
      >
        {isPending && showLoader ? (
          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
        ) : (
          <>{buttonText}</>
        )}
      </Button>
    </div>
  );
}
