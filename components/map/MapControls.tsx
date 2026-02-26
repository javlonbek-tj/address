'use client';

import { Map, Satellite } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useMapFilterStore } from '@/store/useMapFilterStore';

export function MapControls() {
  const { baseMap: currentBaseMap, setBaseMap: onBaseMapChange } =
    useMapFilterStore();
  return (
    <div className='top-1/2 right-3 z-(--z-map-ui) absolute flex flex-col gap-3 -translate-y-1/2'>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onBaseMapChange('osm')}
            className={`w-10 h-10 xl:w-12 xl:h-12 cursor-pointer rounded-full flex items-center justify-center shadow-lg border-2 ${
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
            className={`w-10 h-10 xl:w-12 xl:h-12 cursor-pointer rounded-full flex items-center justify-center shadow-lg border-2 ${
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
