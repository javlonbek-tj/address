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
      <div className="bg-white dark:bg-slate-800/50 shadow-xl p-3 border border-slate-200 dark:border-slate-700 rounded-lg outline-none">
        <p className="mb-1 font-bold text-slate-900 dark:text-slate-100 text-sm">
          {label || data.name}
        </p>
        <div className="flex items-center gap-2">
          <div
            className="rounded-full w-3 h-3"
            style={{
              backgroundColor: data.fill || data.color || data.payload?.fill,
            }}
          />
          <span className="font-medium text-slate-600 dark:text-slate-400 text-xs">
            Soni:{' '}
            <span
              className="font-bold text-slate-900 dark:text-slate-100"
              
            >
              {data.value.toLocaleString()}
            </span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};
