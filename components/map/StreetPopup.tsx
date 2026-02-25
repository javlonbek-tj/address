'use client';

import React from 'react';
import {
  X,
  Waypoints,
  MapPin,
  Hash,
  Ruler,
  Tag,
  Navigation,
} from 'lucide-react';
import type { StreetWithMetadata } from '@/types';

interface Props {
  street: StreetWithMetadata;
  onClose: () => void;
}

export function StreetPopup({ street, onClose }: Props) {
  const { name, type, metadata } = street;

  const formatCoord = (coord?: number) => coord?.toFixed(6) || '—';

  return (
    <div className='absolute top-20 left-6 z-(--z-map-ui) min-w-3xs max-w-2xs bg-white dark:bg-slate-900 overflow-hidden rounded-lg shadow-xl border border-slate-200 dark:border-slate-800'>
      <div className='flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800'>
        <div className='flex items-center gap-2'>
          <div className='p-1 bg-amber-100 dark:bg-amber-900/30 rounded'>
            <Waypoints
              size={14}
              className='text-amber-600 dark:text-amber-400'
            />
          </div>
          <span className='text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest'>
            Ko&apos;cha ma&apos;lumotlari
          </span>
        </div>
        <button
          onClick={onClose}
          className='p-1 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800'
        >
          <X size={14} />
        </button>
      </div>

      <div className='p-3 space-y-3'>
        {/* Name section */}
        <div className='space-y-1'>
          <div className='flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400'>
            <Tag size={12} className='text-slate-400' />
            Nomi
          </div>
          <p className='text-sm font-bold text-slate-900 dark:text-slate-100 wrap-break-word leading-tight'>
            {name}
          </p>
        </div>

        {/* Direction & Length grid */}
        <div className='grid grid-cols-2 gap-3 pt-1'>
          <div className='space-y-1'>
            <div className='flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase'>
              <Navigation size={10} />
              Yo&apos;nalish
            </div>
            <div className='flex items-center gap-2'>
              <div
                className='p-1 bg-blue-50 dark:bg-blue-900/40 rounded-full transition-transform duration-500'
                style={{ transform: `rotate(${metadata?.bearing || 0}deg)` }}
              >
                <Navigation
                  size={12}
                  className='text-blue-600 dark:text-blue-400 fill-blue-600/20'
                />
              </div>
              <p className='text-[10px] font-medium text-slate-600 dark:text-slate-400'>
                {metadata?.bearing ? `${metadata.bearing.toFixed(0)}°` : '—'}
              </p>
            </div>
          </div>
          <div className='space-y-1 border-l border-slate-100 dark:border-slate-800 pl-3'>
            <div className='flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase'>
              <Ruler size={10} />
              Uzunligi
            </div>
            <p className='text-xs font-medium text-slate-700 dark:text-slate-300'>
              {metadata?.length
                ? metadata.length > 1000
                  ? `${(metadata.length / 1000).toFixed(2)} km`
                  : `${metadata.length.toFixed(0)} m`
                : '—'}
            </p>
          </div>
        </div>

        {/* Type section */}
        <div className='space-y-1'>
          <div className='flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase'>
            <Hash size={10} />
            Ko&apos;cha turi
          </div>
          <p className='text-xs font-medium text-slate-700 dark:text-slate-300'>
            {type || 'Aniqlanmagan'}
          </p>
        </div>

        {/* Points section */}
        <div className='pt-2 border-t border-slate-50 dark:border-slate-800/50 space-y-2'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight'>
              <MapPin size={10} className='text-emerald-500' />
              Boshlang&apos;ich nuqta
            </div>
            <p className='text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded'>
              {formatCoord(metadata?.startPoint?.lat)},{' '}
              {formatCoord(metadata?.startPoint?.lng)}
            </p>
          </div>

          <div className='space-y-1.5'>
            <div className='flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight'>
              <MapPin size={10} className='text-red-500' />
              Tugash nuqtasi
            </div>
            <p className='text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded'>
              {formatCoord(metadata?.endPoint?.lat)},{' '}
              {formatCoord(metadata?.endPoint?.lng)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
