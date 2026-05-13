'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/app/actions';
import { loginSchema, LoginSchemaType } from '@/lib';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

function LoginForm() {
  const [isPending, setIsPending] = useState(false);
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
    <main className='dark relative min-h-screen flex items-center justify-center bg-[#0a0a0f]'>
      <div className='w-full max-w-sm mx-6 border border-border bg-card p-10'>
        <h1 className='text-2xl font-bold tracking-tight text-foreground text-center mb-8'>
          Tizimga kirish
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Field data-invalid={!!errors.username}>
            <FieldLabel htmlFor='username' className='text-gray-500'>
              Login
            </FieldLabel>
            <Input
              id='username'
              type='text'
              autoComplete='username'
              placeholder='Login'
              aria-invalid={!!errors.username}
              className='rounded-none h-10 text-gray-200'
              {...register('username')}
            />
            {errors.username && (
              <FieldError errors={[errors.username]} className='text-xs' />
            )}
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor='password' className='text-gray-500'>
              Parol
            </FieldLabel>
            <Input
              id='password'
              type='password'
              autoComplete='current-password'
              placeholder='Parol'
              aria-invalid={!!errors.password}
              className='rounded-none h-10 text-gray-200'
              {...register('password')}
            />
            {errors.password && (
              <FieldError errors={[errors.password]} className='text-xs' />
            )}
          </Field>

          <Button
            type='submit'
            disabled={isPending}
            className='w-full rounded-none h-10 mt-1 cursor-pointer'
          >
            {isPending ? (
              <span className='w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin' />
            ) : (
              'Kirish'
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
