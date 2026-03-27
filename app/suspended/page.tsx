import Link from 'next/link';

export default function SuspendedPage() {
  return (
    <main className='relative min-h-screen flex items-center justify-center bg-[#0a0a0f] overflow-hidden'>
      {/* Ambient blobs */}
      <div className='pointer-events-none absolute -top-40 -left-40 w-125 h-125 rounded-full bg-red-600/20 blur-[120px]' />
      <div className='pointer-events-none absolute -bottom-32 -right-32 w-125 h-125 rounded-full bg-orange-400/10 blur-[100px]' />

      {/* Card */}
      <div className='relative z-10 w-full max-w-105 mx-6 rounded-3xl border border-white/8 bg-white/[0.035] backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-10 text-center'>
        <div className='mb-6 flex justify-center'>
          <div className='w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-red-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={1.5}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
              />
            </svg>
          </div>
        </div>

        <h1 className='text-2xl font-bold tracking-tight text-white/90 mb-3'>
          Hisob bloklangan
        </h1>

        <p className='text-sm text-white/40 mb-8 leading-relaxed'>
          Sizning hisobingiz faol emas. Tizimga kirish uchun administrator bilan
          bog&apos;laning.
        </p>

        <Link
          href='/login'
          className='inline-flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-violet-500 to-violet-700 shadow-[0_8px_24px_rgba(107,60,255,0.35)] hover:shadow-[0_12px_32px_rgba(107,60,255,0.45)] transition-all duration-200'
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    </main>
  );
}
