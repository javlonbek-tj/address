import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface Props {
  className?: string;
  onClick?: () => void;
}

export function ClearButton({ className, onClick }: Props) {
  return (
    <button
      className={cn(
        'absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <X className='h-4 w-4' />
    </button>
  );
}
