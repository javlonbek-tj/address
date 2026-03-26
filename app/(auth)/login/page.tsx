'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction } from '@/app/actions';
import { loginSchema, LoginSchemaType } from '@/lib';
import { FieldGroup } from '@/components/shared';

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setIsPending(true);
    const result = await loginAction(data);
    if (!result.success && result.message) {
      toast.error(result.message);
    } else if (!result.success && result.error) {
      toast.error('Xatolik yuz berdi.');
    } else {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      window.location.href = callbackUrl;
    }
    setIsPending(false);
  };

  return (
    <main className='relative min-h-screen flex items-center justify-center bg-[#0a0a0f] overflow-hidden'>
      {/* Ambient blobs */}
      <div className='pointer-events-none absolute -top-40 -left-40 w-125 h-125 rounded-full bg-violet-600/20 blur-[120px]' />
      <div className='pointer-events-none absolute -bottom-32 -right-32 w-125 h-125 rounded-full bg-teal-400/10 blur-[100px]' />

      {/* Card */}
      <div className='relative z-10 w-full max-w-105 mx-6 rounded-3xl border border-white/8 bg-white/[0.035] backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-10'>
        <h1 className='text-[1.65rem] font-bold tracking-tight text-white/90 leading-tight text-center mb-5'>
          Tizimga kirish
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col'>
          <FieldGroup label='Login' error={errors.username?.message}>
            <input
              id='username'
              type='text'
              autoComplete='username'
              placeholder='Login'
              {...register('username')}
              className={[
                'w-full rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/20',
                'bg-white/5 border outline-none transition-all duration-200',
                errors.username
                  ? 'border-red-400/50 bg-red-500/5 focus:border-red-400/60 focus:ring-2 focus:ring-red-400/15'
                  : 'border-white/10 focus:border-violet-500/60 focus:bg-violet-500/[0.07] focus:ring-2 focus:ring-violet-500/20',
              ].join(' ')}
            />
          </FieldGroup>

          <FieldGroup label='Parol' error={errors.password?.message}>
            <input
              id='password'
              type='password'
              autoComplete='current-password'
              placeholder='Parol'
              {...register('password')}
              className={[
                'w-full rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/20',
                'bg-white/5 border outline-none transition-all duration-200',
                errors.password
                  ? 'border-red-400/50 bg-red-500/5 focus:border-red-400/60 focus:ring-2 focus:ring-red-400/15'
                  : 'border-white/10 focus:border-violet-500/60 focus:bg-violet-500/[0.07] focus:ring-2 focus:ring-violet-500/20',
              ].join(' ')}
            />
          </FieldGroup>

          <button
            type='submit'
            disabled={isPending}
            className={[
              'mt-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white cursor-pointer',
              'bg-linear-to-br from-violet-500 to-violet-700',
              'shadow-[0_8px_24px_rgba(107,60,255,0.35)]',
              'flex items-center justify-center gap-2',
              'transition-all duration-200',
              'hover:shadow-[0_12px_32px_rgba(107,60,255,0.45)]',
              'active:translate-y-0 active:shadow-[0_4px_12px_rgba(107,60,255,0.3)]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
            ].join(' ')}
          >
            {isPending ? (
              <span className='w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin' />
            ) : (
              'Kirish'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
