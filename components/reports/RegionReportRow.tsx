'use client';

import type { RegionReport } from '@/types';
import { ChevronRight } from 'lucide-react';

interface Props {
  row: RegionReport;
  index: number;
  onSelect: (regionId: string) => void;
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

function CountCell({ value, color }: { value: number; color: string }) {
  return (
    <td className={`px-6 py-2 text-xs font-bold whitespace-nowrap ${color}`}>
      {value > 0 ? `+${value.toLocaleString()}` : '—'}
    </td>
  );
}

export function RegionReportRow({ row, index, onSelect }: Props) {
  return (
    <tr
      onClick={() => onSelect(row.regionId)}
      className='group cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/15 dark:even:bg-gray-700/20 dark:odd:bg-gray-800 even:bg-gray-50/50 odd:bg-white transition-all duration-200'
    >
      <td className='px-6 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap'>{index + 1}</td>
      <td className='px-6 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap'>
        <span className='flex items-center gap-1.5'>
          {row.regionName}
          <ChevronRight className='w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity' />
        </span>
      </td>
      <td className='px-6 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap'>{row.totalStreets.toLocaleString()}</td>
      <StatCell count={row.filledCount} percent={row.filledPercent} color='text-emerald-600 dark:text-emerald-400' />
      <StatCell count={row.emptyCount} percent={row.remainingPercent} color='text-red-500 dark:text-red-400' />
      <CountCell value={row.dailyFilled} color='text-blue-600 dark:text-blue-400' />
      <CountCell value={row.weeklyFilled} color='text-violet-600 dark:text-violet-400' />
      <CountCell value={row.monthlyFilled} color='text-orange-600 dark:text-orange-400' />
    </tr>
  );
}
