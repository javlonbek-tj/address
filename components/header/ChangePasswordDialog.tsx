'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import toast from 'react-hot-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib';
import { changePassword } from '@/app/actions';
import { useSession } from '@/lib/auth/auth-client';
import { FormActions } from '@/components/shared';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordDialog({ open, onClose }: Props) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await changePassword(values);
      if (result.success) {
        toast.success("Parol muvaffaqiyatli o'zgartirildi");
        handleClose();
      } else {
        toast.error(result.message || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const username = session?.user?.username ?? '';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Parolni o&apos;zgartirish</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col gap-4 pt-2'
        >
          <div className='flex flex-col gap-1.5'>
            <Label>Login</Label>
            <Input value={username} disabled />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='oldPassword'>Eski parol</Label>
            <Input
              id='oldPassword'
              type='password'
              placeholder='Eski parolni kiriting'
              {...register('oldPassword')}
            />
            {errors.oldPassword && (
              <p className='text-xs text-destructive'>
                {errors.oldPassword.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='newPassword'>Yangi parol</Label>
            <Input
              id='newPassword'
              type='password'
              placeholder='Yangi parolni kiriting'
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className='text-xs text-destructive'>
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='confirmPassword'>Parolni tasdiqlang</Label>
            <Input
              id='confirmPassword'
              type='password'
              placeholder='Parolni qaytа kiriting'
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className='text-xs text-destructive'>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <FormActions
            onCancel={handleClose}
            isPending={isSubmitting}
            submitText='Saqlash'
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
