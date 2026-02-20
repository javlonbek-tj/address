'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface Props {
  stats: StatItem[];
  title?: string;
}

export function MapStatistics({ stats, title = 'Statistika' }: Props) {
  if (stats.length === 0) return null;

  return (
    <div className="top-3 right-3 z-1000 absolute bg-background/95 shadow-xl backdrop-blur-md border rounded-xl w-64 overflow-hidden">
      <div className="flex justify-between items-center bg-muted/30 px-4 py-3 border-b">
        <h3 className="font-semibold text-foreground/80 text-sm">{title}</h3>
      </div>

      <div className="space-y-2 p-3">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group flex justify-between items-center hover:bg-muted/50 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-1.5 rounded-md group-hover:scale-110 transition-transform',
                  stat.bgColor,
                )}
              >
                <stat.icon className={cn('size-4', stat.color)} />
              </div>
              <span className="font-medium text-muted-foreground text-xs">
                {stat.label}
              </span>
            </div>
            <span
              className="font-bold tabular-nums text-foreground text-sm"
              
            >
              {stat.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom accent bar */}
      <div className="bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50 w-full h-1" />
    </div>
  );
}
