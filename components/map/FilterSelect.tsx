'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  options: { id: string; name: string }[];
  onClear?: (e: React.MouseEvent) => void;
}

export function FilterSelect({
  value,
  onValueChange,
  placeholder,
  disabled,
  options,
  onClear,
}: FilterSelectProps) {
  return (
    <div className='group relative shrink-0'>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            'w-full min-w-32 sm:min-w-40 text-xs 3xl:text-sm',
            value && '[&_svg]:hidden',
          )}
          size='sm'
        >
          <SelectValue
            placeholder={placeholder}
            className='truncate text-xs 3xl:text-sm'
          />
        </SelectTrigger>
        {value && onClear && (
          <button
            onClick={onClear}
            className='top-1/2 right-2 z-10 absolute hover:bg-slate-100 p-1 rounded-md text-slate-400 transition-colors -translate-y-1/2 duration-200'
          >
            <X size={14} />
          </button>
        )}
        <SelectContent position='popper' sideOffset={4}>
          {options.map((opt) => (
            <SelectItem
              key={opt.id}
              value={opt.id}
              className='text-xs 3xl:text-sm'
            >
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
