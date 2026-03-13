'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib';

interface Props {
  id: string;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  showEditDelete?: boolean;
}

export function TableActions({
  id,
  onEdit,
  onDelete,
  onView,
  showEditDelete = true,
}: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center gap-1 justify-end'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon-xs'
              onClick={onView}
              className={cn(
                'hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 active:scale-95 transition-all cursor-pointer',
                !showEditDelete && 'pr-10',
              )}
            >
              <Eye />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='**:data-[slot=tooltip-arrow]:hidden bg-gray-900 dark:bg-white shadow-xl px-2 py-1 border-none text-[10px] text-white dark:text-gray-900'>
            Ko&apos;rish
          </TooltipContent>
        </Tooltip>

        {showEditDelete && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon-xs'
                  onClick={onEdit}
                  className='hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 active:scale-95 transition-all cursor-pointer'
                >
                  <Pencil />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='**:data-[slot=tooltip-arrow]:hidden bg-gray-900 dark:bg-white shadow-xl px-2 py-1 border-none text-[10px] text-white dark:text-gray-900'>
                Tahrirlash
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon-xs'
                  onClick={onDelete}
                  className='hover:bg-red-50 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 active:scale-95 transition-all cursor-pointer'
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='**:data-[slot=tooltip-arrow]:hidden bg-gray-900 dark:bg-white shadow-xl px-2 py-1 border-none text-[10px] text-white dark:text-gray-900'>
                O&apos;chirish
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
