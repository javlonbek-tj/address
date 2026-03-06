'use client';

import { FormProvider, type UseFormReturn } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FormActions,
  FormInputField,
  FormSelectField,
} from '@/components/shared';
import { Region, District } from '@/types';
import {
  UserFormValues,
  USER_ROLES,
  USER_STATUSES,
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  REGION_USER_POSITION_OPTIONS,
} from '@/lib';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  form: UseFormReturn<UserFormValues>;
  onSubmit: (values: UserFormValues) => void;
  isSubmitting: boolean;
  isEditing: boolean;
  regions: Region[];
  districts: District[];
}

export function UserFormDialog({
  open,
  onClose,
  title,
  form,
  onSubmit,
  isSubmitting,
  isEditing,
  regions,
  districts,
}: UserFormDialogProps) {
  const selectedRole = form.watch('role');
  const selectedStatus = form.watch('status');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <FormSelectField
                name='status'
                label='Holati'
                placeholder='Holatni tanlang'
                options={USER_STATUS_OPTIONS}
              />
              <FormSelectField
                name='role'
                label='Roli'
                placeholder='Rolni tanlang'
                options={USER_ROLE_OPTIONS}
              />

              {(selectedRole === USER_ROLES.REGION_USER ||
                selectedRole === USER_ROLES.DISTRICT_USER) && (
                <FormSelectField
                  name='regionId'
                  label='Viloyat'
                  placeholder='Viloyatni tanlang'
                  options={regions.map((r) => ({ name: r.name, id: r.id }))}
                />
              )}

              {selectedRole === USER_ROLES.DISTRICT_USER && (
                <FormSelectField
                  name='districtId'
                  label='Tuman'
                  placeholder='Tumanni tanlang'
                  options={districts.map((d) => ({ name: d.name, id: d.id }))}
                />
              )}

              {selectedRole === USER_ROLES.REGION_USER && (
                <FormSelectField
                  name='position'
                  label='Lavozimi'
                  placeholder='Lavozimni tanlang'
                  options={REGION_USER_POSITION_OPTIONS}
                />
              )}

              {selectedStatus === USER_STATUSES.ACTIVE && (
                <>
                  <FormInputField
                    name='fullName'
                    label='F.I.SH'
                    placeholder='Foydalanuvchi ismi'
                  />
                  <FormInputField
                    name='phoneNumber'
                    label='Telefon raqami'
                    placeholder='Masalan: +998901234567'
                  />
                </>
              )}
            </div>

            <FormActions
              onCancel={onClose}
              isEditing={isEditing}
              isPending={isSubmitting}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
