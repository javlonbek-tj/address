'use client';

import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showOverlay?: boolean;
}

const sizeMap = {
  sm: 16,
  md: 32,
  lg: 48,
};

export function Spinner({
  size = 'md',
  className = '',
  showOverlay = true,
}: SpinnerProps) {
  const spinnerElement = (
    <div
      className={`border-blue-600 border-b-2 rounded-full animate-spin ${className}`}
      style={{ width: sizeMap[size], height: sizeMap[size] }}
    ></div>
  );

  if (!showOverlay) {
    return spinnerElement;
  }

  return (
    <div className='z-(--z-overlay) absolute inset-0 flex justify-center items-center bg-white/10 dark:bg-gray-800/10 backdrop-blur-[1px]'>
      {spinnerElement}
    </div>
  );
}
