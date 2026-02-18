'use client';

import React from 'react';
import { Map, Satellite } from 'lucide-react';
import { BaseMapKey } from '@/lib/constants/map';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  currentBaseMap: BaseMapKey;
  onBaseMapChange: (key: BaseMapKey) => void;
}

export function MapControls({ currentBaseMap, onBaseMapChange }: Props) {
  return (
    <div className='absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-1000'>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onBaseMapChange('osm')}
            className={`w-12 h-12 cursor-pointer rounded-full flex items-center justify-center shadow-lg border-2 ${
              currentBaseMap === 'osm'
                ? 'bg-primary text-primary-foreground border-primary/40'
                : 'bg-background/90 backdrop-blur-md text-muted-foreground border-transparent hover:bg-background'
            }`}
          >
            <Map className='size-5' />
          </button>
        </TooltipTrigger>
        <TooltipContent side='left' className='font-medium'>
          Oddiy xarita
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onBaseMapChange('satellite')}
            className={`w-12 h-12 cursor-pointer rounded-full flex items-center justify-center shadow-lg border-2 ${
              currentBaseMap === 'satellite'
                ? 'bg-primary text-primary-foreground border-primary/40'
                : 'bg-background/90 backdrop-blur-md text-muted-foreground border-transparent hover:bg-background'
            }`}
          >
            <Satellite className='size-5' />
          </button>
        </TooltipTrigger>
        <TooltipContent side='left' className='font-medium'>
          Sputnik xaritasi
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
