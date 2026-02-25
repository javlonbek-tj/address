'use client';

import { useState } from 'react';
import {
  Layers,
  Map as MapIcon,
  Navigation,
  Home,
  Waypoints,
  Eye,
  EyeOff,
  X,
  Check,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  filterState: {
    showRegions: boolean;
    setShowRegions: (v: boolean) => void;
    showDistricts: boolean;
    setShowDistricts: (v: boolean) => void;
    showMahallas: boolean;
    setShowMahallas: (v: boolean) => void;
    showStreets: boolean;
    setShowStreets: (v: boolean) => void;
    showProperties: boolean;
    setShowProperties: (v: boolean) => void;
  };
}

export function MapLayersControl({ filterState }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const layers = [
    {
      id: 'regions',
      label: 'Viloyatlar',
      icon: MapIcon,
      value: filterState.showRegions,
      setValue: filterState.setShowRegions,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 'districts',
      label: 'Tumanlar',
      icon: Navigation,
      value: filterState.showDistricts,
      setValue: filterState.setShowDistricts,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      id: 'mahallas',
      label: 'Mahallalar',
      icon: Home,
      value: filterState.showMahallas,
      setValue: filterState.setShowMahallas,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      id: 'streets',
      label: "Ko'chalar",
      icon: Waypoints,
      value: filterState.showStreets,
      setValue: filterState.setShowStreets,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      id: 'properties',
      label: 'Binolar',
      icon: Home,
      value: filterState.showProperties,
      setValue: filterState.setShowProperties,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  const allVisible = layers.every((l) => l.value);

  const toggleAll = () => {
    layers.forEach((layer) => layer.setValue(!allVisible));
  };

  return (
    <div className='absolute bottom-6 left-6 z-(--z-map-ui) flex flex-col gap-2'>
      <div
        className={`
        flex flex-col bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300
        ${isOpen ? 'w-64 p-2' : 'w-12 p-1 bg-transparent border-none shadow-none'}
      `}
      >
        {/* Toggle Button (Visible when collapsed) */}
        {!isOpen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsOpen(true)}
                className='w-10 h-10 flex cursor-pointer items-center justify-center bg-background rounded-xl shadow-lg text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95 border-2 border-transparent hover:border-primary/20'
              >
                <Layers className='w-5 h-5' />
              </button>
            </TooltipTrigger>
            <TooltipContent side='right'>Qatlamlarni boshqarish</TooltipContent>
          </Tooltip>
        )}

        {/* Expanded Content */}
        {isOpen && (
          <div className='flex flex-col gap-1 w-full animate-in fade-in slide-in-from-left-2 duration-200'>
            {/* Header */}
            <div className='flex items-center justify-between px-2 py-2 mb-1 border-b'>
              <span className='text-sm font-bold text-foreground'>
                Qatlamlar
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className='p-1 cursor-pointer hover:bg-muted rounded-full transition-colors'
              >
                <X className='w-4 h-4 text-muted-foreground' />
              </button>
            </div>

            {/* Master Toggle */}
            <button
              onClick={toggleAll}
              className='flex items-center cursor-pointer justify-between px-2 py-2 rounded-lg hover:bg-muted/50 group transition-colors'
            >
              <div className='flex items-center gap-2'>
                {allVisible ? (
                  <Eye className='w-4 h-4 text-primary' />
                ) : (
                  <EyeOff className='w-4 h-4 text-muted-foreground' />
                )}
                <span className='text-sm font-medium text-foreground'>
                  Barchasi
                </span>
              </div>
              <div
                className={`w-8 h-4 rounded-full relative transition-colors ${allVisible ? 'bg-primary' : 'bg-muted'}`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${allVisible ? 'right-0.5' : 'left-0.5'}`}
                />
              </div>
            </button>

            <div className='h-px bg-linear-to-r from-transparent via-border to-transparent my-1' />

            {/* List */}
            <div className='flex flex-col gap-1 max-h-75 overflow-y-auto pr-1'>
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => layer.setValue(!layer.value)}
                  className='flex items-center cursor-pointer justify-between px-2 py-2 rounded-lg hover:bg-muted/50 group transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`p-1.5 rounded-md transition-colors ${layer.value ? `${layer.bgColor} ${layer.color}` : 'bg-muted text-muted-foreground'}`}
                    >
                      <layer.icon className='w-4 h-4' />
                    </div>
                    <span
                      className={`text-sm ${layer.value ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                    >
                      {layer.label}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {layer.value && <Check className='w-4 h-4 text-primary' />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
