import { Loader2 } from 'lucide-react';

export function Spinner() {
  return (
    <div className='absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-10'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
    </div>
  );
}

export function MapSpinner() {
  return (
    <div className='absolute inset-0 z-25000 flex items-center justify-center bg-background/30 backdrop-blur-[1px] pointer-events-none'>
      <div className='flex items-center gap-2 bg-background/90 px-4 py-2 rounded-lg shadow-md border'>
        <Loader2 size={16} className='animate-spin text-primary' />
        <span className='text-sm text-muted-foreground'>Yuklanmoqda...</span>
      </div>
    </div>
  );
}
