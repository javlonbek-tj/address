'use client';

import { AnalyticsCharts } from './AnalyticsCharts';
import { DATA_HEALTH_CHART_COLORS } from './constants';

interface DataHealthChartProps {
  hidden: number;
  total: number;
}

export function DataHealthChart({ hidden, total }: DataHealthChartProps) {
  const visible = total - hidden;
  const data = [
    { name: 'Faol', value: visible },
    { name: 'Optimallashgan', value: hidden },
  ];

  return (
    <div className="col-span-full lg:col-span-1 xl:col-span-2">
      <AnalyticsCharts
        title="Ma'lumot holati"
        type="pie"
        data={data}
        colors={DATA_HEALTH_CHART_COLORS}
      />
    </div>
  );
}
