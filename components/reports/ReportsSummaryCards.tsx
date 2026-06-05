'use client';

import type { ReportSummary } from '@/types';

interface CardProps {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}

function Card({ label, value, sub, color }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${color} p-4 flex flex-col gap-1 shadow-sm`}>
      <span className='text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
        {label}
      </span>
      <span className='text-xl font-bold text-gray-900 dark:text-gray-100'>
        {value}
      </span>
      {sub && (
        <span className='text-[11px] text-gray-500 dark:text-gray-400'>{sub}</span>
      )}
    </div>
  );
}

export function ReportsSummaryCards({ summary }: { summary: ReportSummary }) {
  return (
    <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 px-8 pt-8'>
      <Card
        label="Jami ko'chalar"
        value={summary.totalStreets.toLocaleString()}
        color='border-gray-200 dark:border-gray-700'
      />
      <Card
        label='UzKad qoʻyilgan'
        value={summary.filledCount.toLocaleString()}
        sub={`${summary.filledPercent}% bajarildi`}
        color='border-emerald-200 dark:border-emerald-800'
      />
      <Card
        label='UzKad qoʻyilmagan'
        value={(summary.totalStreets - summary.filledCount).toLocaleString()}
        sub={`${100 - summary.filledPercent}% qoldi`}
        color='border-red-200 dark:border-red-800'
      />
      <Card
        label='Bugungi natija'
        value={summary.dailyFilled > 0 ? `+${summary.dailyFilled.toLocaleString()}` : '—'}
        sub='kunlik'
        color='border-blue-200 dark:border-blue-800'
      />
      <Card
        label='Haftalik natija'
        value={summary.weeklyFilled > 0 ? `+${summary.weeklyFilled.toLocaleString()}` : '—'}
        sub='shu hafta'
        color='border-violet-200 dark:border-violet-800'
      />
      <Card
        label='Oylik natija'
        value={summary.monthlyFilled > 0 ? `+${summary.monthlyFilled.toLocaleString()}` : '—'}
        sub='shu oy'
        color='border-orange-200 dark:border-orange-800'
      />
    </div>
  );
}
