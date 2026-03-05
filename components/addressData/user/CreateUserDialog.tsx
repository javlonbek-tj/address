'use client';

import { UserFormDialog } from './UserFormDialog';
import { useCreateUserForm, useDistrictsList } from '@/hooks';
import { Region } from '@/types';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  regions: Region[];
}

export function CreateUserDialog({
  open,
  onClose,
  regions,
}: CreateUserDialogProps) {
  const { form, isSubmitting, onSubmit } = useCreateUserForm({ open, onClose });
  const selectedRegionId = form.watch('regionId');
  const { districts } = useDistrictsList(selectedRegionId || '');

  return (
    <UserFormDialog
      title="Yangi foydalanuvchi qo'shish"
      open={open}
      onClose={onClose}
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      isEditing={false}
      regions={regions}
      districts={districts}
    />
  );
}
