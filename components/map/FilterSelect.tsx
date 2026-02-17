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
  onClear: (e: React.MouseEvent) => void;
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
    <div className='shrink-0 relative group'>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            'w-44 h-10 border rounded-lg bg-background text-sm px-3 pr-8 disabled:opacity-50 transition-all duration-200',
            value && '[&_svg]:hidden',
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {value && (
          <button
            onClick={onClear}
            className='absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md text-slate-400 z-10 transition-colors duration-200'
          >
            <X size={14} />
          </button>
        )}
        <SelectContent
          position='popper'
          sideOffset={4}
          className='rounded-xl shadow-xl z-10001'
        >
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id} className='rounded-lg'>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
