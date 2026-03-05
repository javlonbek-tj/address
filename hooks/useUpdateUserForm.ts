'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { userSchema, type UserFormValues, USER_ROLES } from '@/lib';
import { updateUser } from '@/app/actions';
import type { User } from '@/lib/generated/prisma/client';

interface Props {
  user: User;
  open: boolean;
  onClose: () => void;
}

export function useUpdateUserForm({ user, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialValues = useCallback(
    (u: User): UserFormValues => ({
      fullName: u.fullName || '',
      phoneNumber: u.phoneNumber || '',
      role: u.role,
      status: u.status,
      position: (u.position as string) || null,
      regionId: u.regionId || null,
      districtId: u.districtId || null,
    }),
    [],
  );

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: getInitialValues(user),
  });

  const { reset } = form;

  useEffect(() => {
    if (open && user) {
      reset(getInitialValues(user));
    }
  }, [user, reset, open, getInitialValues]);

  const selectedRole = form.watch('role');

  useEffect(() => {
    if (
      selectedRole === USER_ROLES.SUPERADMIN ||
      selectedRole === USER_ROLES.ADMIN
    ) {
      form.setValue('regionId', null);
      form.setValue('districtId', null);
      form.setValue('position', null);
    } else if (selectedRole === USER_ROLES.REGION_USER) {
      form.setValue('districtId', null);
    }
  }, [selectedRole, form]);

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await updateUser(user.id, values as any);
      if (result.success) {
        toast.success('Foydalanuvchi yangilandi');
        queryClient.invalidateQueries({ queryKey: ['users-table'] });
        onClose();
      } else {
        toast.error(result.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, isSubmitting, onSubmit };
}
