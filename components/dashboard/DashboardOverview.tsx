'use client';

import { AnalyticsCards } from './AnalyticsCards';
import { RegionChart } from './RegionChart';
import { StreetTypeChart } from './StreetTypeChart';
import { DataHealthChart } from './DataHealthChart';

interface Props {
  data: {
    counts: {
      regions: number;
      districts: number;
      mahallas: number;
      streets: number;
      properties: number;
    };
    charts: {
      regions: { name: string; mahallas: number }[];
      streetTypes: { name: string; value: number }[];
      dataHealth: { hiddenMahallas: number; totalMahallas: number };
    };
  };
}

export function DashboardOverview({ data }: Props) {
  return (
    <div className='flex-1 space-y-6 p-6'>
      <h2 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50'>
        Umumiy ko&apos;rinish
      </h2>

      <AnalyticsCards counts={data.counts} />

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <RegionChart data={data.charts.regions} />
        <StreetTypeChart data={data.charts.streetTypes} />
        <DataHealthChart
          hidden={data.charts.dataHealth.hiddenMahallas}
          total={data.charts.dataHealth.totalMahallas}
        />
      </div>
    </div>
  );
}
