export function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col mb-5'>
      <label
        className={[
          'text-[0.7rem] font-semibold tracking-[0.08em] uppercase mb-2 transition-colors duration-200',
          error ? 'text-red-400/85' : 'text-white/40',
        ].join(' ')}
      >
        {label}
      </label>

      {children}

      {/* Fixed-height slot — this is what prevents layout shift */}
      <div className='h-4.5 mt-1.5 overflow-hidden'>
        {error && (
          <span className='flex items-center gap-1.5 text-[0.7rem] font-medium text-red-400/90'>
            <span className='inline-flex items-center justify-center w-3 h-3 rounded-full bg-red-400/20 text-[0.55rem] font-bold shrink-0'>
              !
            </span>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
