'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { ChartData } from './types';

interface BarChartItemProps {
  data: ChartData[];
  colors: string[];
}

export function BarChartItem({ data, colors }: BarChartItemProps) {
  return (
    <BarChart
      data={data}
      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
    >
      <CartesianGrid
        strokeDasharray='3 3'
        vertical={false}
        stroke='#E2E8F0'
        opacity={0.5}
      />
      <XAxis
        dataKey='name'
        axisLine={false}
        tickLine={false}
        tick={{
          fill: '#94A3B8',
          fontSize: 10,
          dy: 25,
          dx: -10,
        }}
        interval={0}
        angle={-45}
        textAnchor='end'
        height={60}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: '#94A3B8', fontSize: 11 }}
      />
      <Tooltip
        content={<ChartTooltip />}
        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
      />
      <Bar
        dataKey='value'
        radius={[6, 6, 0, 0]}
        className='cursor-pointer'
        animationDuration={1500}
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={colors[index % colors.length]}
            fillOpacity={0.8}
            className='hover:fill-opacity-100 transition-all duration-300'
          />
        ))}
      </Bar>
    </BarChart>
  );
}
