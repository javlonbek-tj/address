'use client';

import { UserFormDialog } from './UserFormDialog';
import { useUpdateUserForm, useDistrictsList } from '@/hooks';
import { Region } from '@/types';
import type { User } from '@/types/user';

interface UpdateUserDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
  regions: Region[];
}

export function UpdateUserDialog({
  user,
  open,
  onClose,
  regions,
}: UpdateUserDialogProps) {
  const { form, isSubmitting, onSubmit } = useUpdateUserForm({
    user,
    open,
    onClose,
  });

  const selectedRegionId = form.watch('regionId');
  const { districts } = useDistrictsList(selectedRegionId || '');

  return (
    <UserFormDialog
      title='Foydalanuvchini tahrirlash'
      open={open}
      onClose={onClose}
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      isEditing={true}
      regions={regions}
      districts={districts}
    />
  );
}
