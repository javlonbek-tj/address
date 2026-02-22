'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { ChartData } from './types';

interface PieChartItemProps {
  data: ChartData[];
  colors: string[];
}

export function PieChartItem({ data, colors }: PieChartItemProps) {
  return (
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
        animationDuration={1500}
        label={({ name, percent, x, y, cx }) => (
          <text
            x={x}
            y={y}
            fill="currentColor"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="fill-slate-500 dark:fill-slate-400 font-medium text-[12px] xl:text-[14px]"
          >
            {`${name} ${((percent || 0) * 100).toFixed(0)}%`}
          </text>
        )}
        labelLine={false}
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={colors[index % colors.length]}
            stroke="none"
          />
        ))}
      </Pie>
      <Tooltip content={<ChartTooltip />} />
      <Legend
        verticalAlign="bottom"
        align="center"
        iconType="circle"
        wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
      />
    </PieChart>
  );
}
