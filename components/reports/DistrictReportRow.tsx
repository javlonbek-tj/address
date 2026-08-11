'use client';

import type { DistrictReport } from '@/types';

interface Props {
  row: DistrictReport;
  index: number;
  showRegion: boolean;
}

function StatCell({ count, percent, color }: { count: number; percent: number; color: string }) {
  return (
    <td className='px-6 py-2 whitespace-nowrap min-w-[110px]'>
      <div className='flex items-center justify-between gap-2 mb-0.5'>
        <span className={`text-xs font-bold ${color}`}>{count.toLocaleString()}</span>
        <span className='text-[10px] text-gray-400'>{percent}%</span>
      </div>
      <div className='w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1'>
        <div
          className={`h-1 rounded-full transition-all duration-500 ${color.includes('emerald') ? 'bg-emerald-500' : 'bg-red-400'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </td>
  );
}

export function DistrictReportRow({ row, index, showRegion }: Props) {
  return (
    <tr className='group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 dark:even:bg-gray-700/20 dark:odd:bg-gray-800 even:bg-gray-50/50 odd:bg-white transition-all duration-200'>
      <td className='px-6 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap'>{index + 1}</td>
      {showRegion && (
        <td className='px-6 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap'>{row.regionName}</td>
      )}
      <td className='px-6 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap'>{row.districtName}</td>
      <td className='px-6 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap'>{row.totalStreets.toLocaleString()}</td>
      <StatCell count={row.filledCount} percent={row.filledPercent} color='text-emerald-600 dark:text-emerald-400' />
      <StatCell count={row.emptyCount} percent={row.remainingPercent} color='text-red-500 dark:text-red-400' />
    </tr>
  );
}
