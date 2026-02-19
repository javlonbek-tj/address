'use client';

export const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className='bg-white dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl outline-none'>
        <p className='text-sm font-bold text-slate-900 dark:text-slate-100 mb-1'>
          {label || data.name}
        </p>
        <div className='flex items-center gap-2'>
          <div
            className='w-3 h-3 rounded-full'
            style={{
              backgroundColor: data.fill || data.color || data.payload?.fill,
            }}
          />
          <span className='text-xs font-medium text-slate-600 dark:text-slate-400'>
            Soni:{' '}
            <span className='font-bold text-slate-900 dark:text-slate-100'>
              {data.value.toLocaleString()}
            </span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};
