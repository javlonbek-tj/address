'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { createUser, updateUser } from '@/app/actions';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Region, District } from '@/types';

const userSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Toʻliq ism kamida 2 ta belgidan iborat boʻlishi kerak'),
  phoneNumber: z.string().min(9, 'Telefon raqami notoʻgʻri'),
  role: z.string(),
  status: z.string(),
  position: z.string().optional().nullable(),
  regionId: z.string().optional().nullable(),
  districtId: z.string().optional().nullable(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  user?: any;
  regions: Region[];
  districts: District[];
}

export function UserFormDialog({
  open,
  onClose,
  user,
  regions,
  districts,
}: UserFormDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      role: 'district_user',
      status: 'active',
      position: null,
      regionId: null,
      districtId: null,
    },
  });

  const selectedRole = form.watch('role');

  useEffect(() => {
    if (selectedRole === 'superadmin' || selectedRole === 'admin') {
      form.setValue('regionId', null);
      form.setValue('districtId', null);
      form.setValue('position', null);
    } else if (selectedRole === 'region_user') {
      form.setValue('districtId', null);
    }
  }, [selectedRole, form]);

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        status: user.status,
        position: user.position || null,
        regionId: user.regionId || null,
        districtId: user.districtId || null,
      });
    } else {
      form.reset({
        fullName: '',
        phoneNumber: '',
        role: 'district_user',
        status: 'active',
        position: null,
        regionId: null,
        districtId: null,
      });
    }
  }, [user, form, open]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      let result;
      if (user) {
        result = await updateUser(user.id, values);
      } else {
        result = await createUser(values);
      }

      if (result.success) {
        toast.success(
          user ? 'Foydalanuvchi yangilandi' : 'Foydalanuvchi yaratildi',
        );
        queryClient.invalidateQueries({ queryKey: ['users-table'] });
        onClose();
      } else {
        toast.error(result.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-125'>
        <DialogHeader>
          <DialogTitle>
            {user
              ? 'Foydalanuvchini tahrirlash'
              : "Yangi foydalanuvchi qo'shish"}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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

            <div className='grid grid-cols-2 gap-4'>
              <FormSelectField
                name='role'
                label='Roli'
                placeholder='Rolni tanlang'
                options={[
                  { name: 'Superadmin', id: 'superadmin' },
                  { name: 'Admin', id: 'admin' },
                  { name: 'Viloyat xodimi', id: 'region_user' },
                  { name: 'Tuman xodimi', id: 'district_user' },
                ]}
              />
              <FormSelectField
                name='status'
                label='Holati'
                placeholder='Holatni tanlang'
                options={[
                  { name: 'Faol', id: 'active' },
                  { name: 'Nofaol', id: 'inactive' },
                ]}
              />
            </div>

            {(selectedRole === 'region_user' ||
              selectedRole === 'district_user') && (
              <FormSelectField
                name='regionId'
                label='Viloyat'
                placeholder='Viloyatni tanlang'
                options={regions.map((r) => ({ name: r.name, id: r.id }))}
              />
            )}

            {selectedRole === 'district_user' && (
              <FormSelectField
                name='districtId'
                label='Tuman'
                placeholder='Tumanni tanlang'
                options={districts.map((d) => ({ name: d.name, id: d.id }))}
              />
            )}

            {selectedRole === 'region_user' && (
              <FormSelectField
                name='position'
                label='Lavozimi'
                placeholder='Lavozimni tanlang'
                options={[
                  { name: "Sho'ba boshlig'i", id: 'boss' },
                  { name: 'Bosh mutaxassis', id: 'assistant' },
                ]}
              />
            )}

            <FormActions
              onCancel={onClose}
              isEditing={!!user}
              isPending={form.formState.isSubmitting}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
