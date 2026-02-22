'use client';

import { AnalyticsCharts } from './AnalyticsCharts';
import { REGION_CHART_COLORS } from './constants';

interface RegionChartProps {
  data: {
    name: string;
    mahallas: number;
  }[];
}

export function RegionChart({ data }: RegionChartProps) {
  const chartData = data.map((region) => ({
    name: region.name.replace(' viloyati', '').replace(' Respublikasi', ''),
    value: region.mahallas,
  }));

  return (
    <div className="col-span-full lg:col-span-2 xl:col-span-3">
      <AnalyticsCharts
        title="Mahalla ma'lumot"
        type="bar"
        data={chartData}
        colors={REGION_CHART_COLORS}
      />
    </div>
  );
}
