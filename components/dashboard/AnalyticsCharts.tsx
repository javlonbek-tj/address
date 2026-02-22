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
      className="bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md backdrop-blur-sm p-6 border border-slate-200 dark:border-slate-700 rounded-2xl transition-shadow"
    >
      <h3 className="flex items-center gap-2 mb-6 font-bold text-slate-900 dark:text-slate-100 text-base 2xl:text-lg">
        <span className="bg-blue-600 rounded-full w-1 2xl:w-1.5 h-4 2xl:h-6" />
        {title}
      </h3>

      <div className="w-full h-75">
        <ResponsiveContainer width="100%" height="100%">
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
