'use client';

import { useRegionsList } from '@/hooks';

interface Props {
  regionId: string;
  onRegionChange: (value: string) => void;
  showRegionFilter: boolean;
}

export function ReportsFilters({ regionId, onRegionChange, showRegionFilter }: Props) {
  const { regions } = useRegionsList();

  if (!showRegionFilter) return null;

  return (
    <div className='flex items-center gap-3 px-8 pt-6'>
      <label className='text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider'>
        Viloyat:
      </label>
      <select
        value={regionId}
        onChange={(e) => onRegionChange(e.target.value)}
        className='h-9 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
      >
        <option value='all'>Barchasi</option>
        {regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
