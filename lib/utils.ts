import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Map as MapIcon, Navigation, Home, Waypoints } from 'lucide-react';
import type { Statistics } from '@/types';
import { StatItem } from '@/components/map/MapStatistics';
import { MAX_UPLOAD_SIZE } from './constants';

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

export const validateFile = (
  file: File,
  acceptFileTypes: string[],
): string | null => {
  if (!acceptFileTypes.includes(file.type)) {
    return `Faqat ${acceptFileTypes.join(', ')} fayllariga ruxsat berilgan`;
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return `Fayl hajmi ${MAX_UPLOAD_SIZE / 1024 / 1024}MB dan oshmasligi kerak`;
  }
  return null;
};

export const formatCadastralNumber = (raw: string): string => {
  const cleaned = raw.replace(/[^\d/]/g, '');
  const [mainPart, suffixPart] = cleaned.split('/');

  const segLengths = [2, 2, 2, 2, 2, 4];
  const digits = mainPart || '';
  const segments: string[] = [];
  let pos = 0;

  for (let i = 0; i < segLengths.length; i++) {
    const len = segLengths[i];
    const chunk = digits.slice(pos, pos + len);
    if (!chunk) break;
    segments.push(chunk);
    pos += len;
    if (pos >= digits.length) break;
  }

  let result = segments.join(':');

  if (suffixPart !== undefined) {
    // Limit suffix to 4 digits
    result += '/' + suffixPart.slice(0, 4);
  }

  return result;
};
