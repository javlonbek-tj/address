'use client';

import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Copy, Check } from 'lucide-react';

export function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleCopy}
            className='inline-flex items-center gap-2 px-3 py-0.5 rounded-md transition-all duration-200 cursor-pointer group/copy hover:bg-blue-100/50 dark:hover:bg-gray-700/80'
          >
            <span className='text-gray-600 dark:text-gray-400 group-hover/copy:text-blue-600 dark:group-hover/copy:text-blue-400 font-medium transition-colors'>
              {code}
            </span>
            {copied ? (
              <Check className='w-3.5 h-3.5 text-emerald-500 shrink-0' />
            ) : (
              <Copy className='w-3.5 h-3.5 opacity-0 group-hover/copy:opacity-100 text-blue-500 shrink-0 transition-opacity' />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className='bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 transition-colors **:data-[slot=tooltip-arrow]:hidden'>
          {copied ? 'Nusxa olindi!' : 'Buferga saqlash'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
