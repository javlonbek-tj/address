'use client';

import { AnalyticsCharts } from './AnalyticsCharts';
import { STREET_TYPE_CHART_COLORS } from './constants';

interface StreetTypeChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

export function StreetTypeChart({ data }: StreetTypeChartProps) {
  const filteredData = data
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className='col-span-full lg:col-span-2'>
      <AnalyticsCharts
        title="Ko'cha turlari"
        type='pie'
        data={filteredData}
        colors={STREET_TYPE_CHART_COLORS}
      />
    </div>
  );
}
