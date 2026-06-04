'use client';

import type { ReportSummary } from '@/types';

interface Props {
  summary: ReportSummary;
}

interface CardProps {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}

function Card({ label, value, sub, color }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${color} p-5 flex flex-col gap-1 shadow-sm`}>
      <span className='text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
        {label}
      </span>
      <span className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
        {value}
      </span>
      {sub && (
        <span className='text-xs text-gray-500 dark:text-gray-400'>{sub}</span>
      )}
    </div>
  );
}

export function ReportsSummaryCards({ summary }: Props) {
  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 px-8 pt-8'>
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
        label='Bugun qoʻyilgan'
        value={summary.dailyFilled.toLocaleString()}
        sub='kunlik natija'
        color='border-blue-200 dark:border-blue-800'
      />
    </div>
  );
}
