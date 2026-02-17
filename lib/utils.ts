import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Map as MapIcon, Navigation, Home, Waypoints } from 'lucide-react';
import { Statistics } from '@/types';
import { StatItem } from '@/components/map/MapStatistics';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatMapStatistics = (
  statistics: Statistics | null,
): StatItem[] => {
  if (!statistics) return [];

  const items: StatItem[] = [];

  if (statistics.regions !== undefined) {
    items.push({
      label: 'Viloyatlar',
      value: statistics.regions,
      icon: MapIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    });
  }

  if (statistics.districts !== undefined) {
    items.push({
      label: 'Tumanlar',
      value: statistics.districts,
      icon: Navigation,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    });
  }

  if (statistics.mahallas !== undefined) {
    items.push({
      label: 'Mahallalar',
      value: statistics.mahallas,
      icon: Home,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    });
  }

  if (statistics.streets !== undefined) {
    items.push({
      label: "Ko'chalar",
      value: statistics.streets,
      icon: Waypoints,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    });
  }

  return items;
};
