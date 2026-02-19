'use client';

import { cn } from '@/lib';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  className?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  className,
  title = "Ma'lumotlarni yuklashda xatolik",
  description = "Sahifani yangilang yoki keyinroq urinib ko'ring.",
  onRetry,
}: Props) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className='relative flex flex-col items-center gap-6 px-10 py-12 max-w-sm w-full'>
        {/* Ambient glow */}
        <div className='absolute inset-0 rounded-2xl bg-red-500/5 dark:bg-red-500/10 blur-xl' />

        {/* Card */}
        <div className='relative w-full rounded-2xl border border-red-100 dark:border-red-900/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl shadow-red-500/5 px-8 py-10 flex flex-col items-center gap-5 text-center'>
          {/* Icon container */}
          <div className='relative flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/60 ring-1 ring-red-100 dark:ring-red-900/50'>
            <AlertTriangle
              className='w-7 h-7 text-red-500 dark:text-red-400'
              strokeWidth={1.75}
            />
            {/* Ping animation */}
            <span className='absolute inline-flex w-full h-full rounded-full bg-red-400/20 animate-ping' />
          </div>

          {/* Text */}
          <div className='flex flex-col gap-2'>
            <h2 className='text-base font-semibold tracking-tight text-slate-800 dark:text-slate-100'>
              {title}
            </h2>
            <p className='text-sm text-slate-500 dark:text-slate-400 leading-relaxed'>
              {description}
            </p>
          </div>

          {/* Retry button */}
          {onRetry && (
            <button
              onClick={onRetry}
              className='mt-1 inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium
                         bg-red-500 hover:bg-red-600 active:bg-red-700
                         text-white shadow-md shadow-red-500/25
                         transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2'
            >
              <RefreshCw className='w-3.5 h-3.5' />
              Qayta urinish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
