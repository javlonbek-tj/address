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
}

export function TableActions({ id, onEdit, onDelete }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex justify-end items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/address-data/${id}`}>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg w-8 h-8 text-blue-600 dark:text-blue-400 active:scale-95 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent className="**:data-[slot=tooltip-arrow]:hidden bg-gray-900 dark:bg-white shadow-xl px-2 py-1 border-none text-[10px] text-white dark:text-gray-900">
            Ko&apos;rish
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg w-8 h-8 text-gray-600 dark:text-gray-300 active:scale-95 transition-all cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="**:data-[slot=tooltip-arrow]:hidden bg-gray-900 dark:bg-white shadow-xl px-2 py-1 border-none text-[10px] text-white dark:text-gray-900">
            Tahrirlash
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              className="hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg w-8 h-8 text-red-600 dark:text-red-400 active:scale-95 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="**:data-[slot=tooltip-arrow]:hidden bg-gray-900 dark:bg-white shadow-xl px-2 py-1 border-none text-[10px] text-white dark:text-gray-900">
            O&apos;chirish
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
