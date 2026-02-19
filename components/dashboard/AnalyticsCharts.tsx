'use client';

import { ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { AnalyticsChartsProps } from './types';
import { BarChartItem } from './BarChartItem';
import { PieChartItem } from './PieChartItem';

export function AnalyticsCharts({
  data,
  title,
  type,
  colors,
}: AnalyticsChartsProps) {
  if (!data || data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='bg-white dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow'
    >
      <h3 className='text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2'>
        <span className='w-1.5 h-6 bg-blue-600 rounded-full' />
        {title}
      </h3>

      <div className='h-75 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          {type === 'bar' ? (
            <BarChartItem data={data} colors={colors} />
          ) : (
            <PieChartItem data={data} colors={colors} />
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
