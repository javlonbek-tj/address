'use client';

import { Loader2 } from 'lucide-react';

export function Spinner() {
  return (
    <div className="z-10 absolute inset-0 flex justify-center items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="border-blue-600 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
    </div>
  );
}

export function MapSpinner() {
  return (
    <div className="z-25000 absolute inset-0 flex justify-center items-center bg-background/30 backdrop-blur-[1px] pointer-events-none">
      <div className="flex items-center gap-2 bg-background/90 shadow-md px-4 py-2 border rounded-lg">
        <Loader2 size={16} className="text-primary animate-spin" />
        <span className="text-muted-foreground text-sm">Yuklanmoqda...</span>
      </div>
    </div>
  );
}
