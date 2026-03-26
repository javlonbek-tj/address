'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import {
  updateUserSchema,
  type UpdateUserFormValues,
  USER_ROLES,
  USER_STATUSES,
} from '@/lib';
import { updateUser } from '@/app/actions';
import type { User } from '@/types/user';

interface Props {
  user: User;
  open: boolean;
  onClose: () => void;
}

export function useUpdateUserForm({ user, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialValues = useCallback(
    (user: User): UpdateUserFormValues => ({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      status: user.status,
      position: (user.position as string) || null,
      regionId: user.region?.id || null,
      districtId: user.district?.id || null,
    }),
    [],
  );

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: getInitialValues(user),
  });

  const { reset } = form;

  useEffect(() => {
    if (open && user) {
      reset(getInitialValues(user));
    }
  }, [user, reset, open, getInitialValues]);

  const selectedRole = form.watch('role');
  const selectedStatus = form.watch('status');

  useEffect(() => {
    if (selectedStatus === USER_STATUSES.INACTIVE) {
      form.setValue('fullName', '');
      form.setValue('phoneNumber', '');
    }
  }, [selectedStatus, form]);

  useEffect(() => {
    if (
      selectedRole === USER_ROLES.SUPERADMIN ||
      selectedRole === USER_ROLES.ADMIN
    ) {
      form.setValue('regionId', null);
      form.setValue('districtId', null);
      form.setValue('position', null);
      form.setValue('status', USER_STATUSES.ACTIVE);
    } else if (selectedRole === USER_ROLES.REGION_USER) {
      form.setValue('districtId', null);
    }
  }, [selectedRole, form]);

  const onSubmit = async (values: UpdateUserFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await updateUser(user.id, values);
      if (result.success) {
        toast.success('Foydalanuvchi yangilandi');
        queryClient.invalidateQueries({ queryKey: ['users-table'] });
        onClose();
      } else {
        toast.error(result.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, isSubmitting, onSubmit };
}
