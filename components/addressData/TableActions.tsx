'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import Link from 'next/link';

interface Props {
  id: string;
  onEdit: () => void;
  onDelete: () => void;
  activeTab: string;
}

export function TableActions({ id, onEdit, onDelete, activeTab }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex items-center justify-end gap-1'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/address-data/${activeTab}/${id}`}>
              <Button
                variant='ghost'
                size='icon-sm'
                className='h-8 w-8 cursor-pointer rounded-lg hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/40 dark:text-blue-400 transition-all active:scale-95'
              >
                <Eye className='w-4 h-4' />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent className='bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 **:data-[slot=tooltip-arrow]:hidden'>
            Ko&apos;rish
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={onEdit}
              className='h-8 w-8 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all active:scale-95'
            >
              <Pencil className='w-4 h-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 **:data-[slot=tooltip-arrow]:hidden'>
            Tahrirlash
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={onDelete}
              className='h-8 w-8 cursor-pointer rounded-lg hover:bg-red-50 text-red-600 dark:hover:bg-red-900/40 dark:text-red-400 transition-all active:scale-95'
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none shadow-xl text-[10px] py-1 px-2 **:data-[slot=tooltip-arrow]:hidden'>
            O&apos;chirish
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
