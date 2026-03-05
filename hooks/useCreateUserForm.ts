'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import {
  userSchema,
  type UserFormValues,
  USER_ROLES,
  USER_STATUSES,
} from '@/lib';
import { createUser } from '@/app/actions';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function useCreateUserForm({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialValues = useCallback(
    (): UserFormValues => ({
      fullName: '',
      phoneNumber: '',
      role: '',
      status: USER_STATUSES.ACTIVE,
      position: null,
      regionId: null,
      districtId: null,
    }),
    [],
  );

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: getInitialValues(),
  });

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset(getInitialValues());
    }
  }, [open, reset, getInitialValues]);

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
      const result = await createUser(values as any);
      if (result.success) {
        toast.success('Foydalanuvchi yaratildi');
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
