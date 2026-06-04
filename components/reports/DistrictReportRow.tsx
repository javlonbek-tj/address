'use client';

import type { DistrictReport } from '@/types';

interface Props {
  row: DistrictReport;
  index: number;
  showRegion: boolean;
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className='w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-1'>
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function DistrictReportRow({ row, index, showRegion }: Props) {
  return (
    <tr className='group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 dark:even:bg-gray-700/20 dark:odd:bg-gray-800 even:bg-gray-50/50 odd:bg-white transition-all duration-200'>
      <td className='px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap'>
        {index + 1}
      </td>
      {showRegion && (
        <td className='px-6 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap'>
          {row.regionName}
        </td>
      )}
      <td className='px-6 py-3 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap'>
        {row.districtName}
      </td>
      <td className='px-6 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap'>
        {row.totalStreets.toLocaleString()}
      </td>
      <td className='px-6 py-3 whitespace-nowrap min-w-[120px]'>
        <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400'>
          {row.filledCount.toLocaleString()}
        </span>
        <ProgressBar percent={row.filledPercent} color='bg-emerald-500' />
        <span className='text-[10px] text-gray-400'>{row.filledPercent}%</span>
      </td>
      <td className='px-6 py-3 whitespace-nowrap min-w-[120px]'>
        <span className='text-xs font-bold text-red-500 dark:text-red-400'>
          {row.emptyCount.toLocaleString()}
        </span>
        <ProgressBar percent={row.remainingPercent} color='bg-red-400' />
        <span className='text-[10px] text-gray-400'>{row.remainingPercent}%</span>
      </td>
      <td className='px-6 py-3 text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap'>
        {row.dailyFilled > 0 ? `+${row.dailyFilled}` : '—'}
      </td>
    </tr>
  );
}
