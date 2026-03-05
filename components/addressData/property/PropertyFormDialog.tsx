'use client';

import { FormProvider, UseFormReturn } from 'react-hook-form';
import {
  FormActions,
  FormInputField,
  FormSelectField,
  CadastralInput,
} from '@/components/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMahallasList, useStreetsByDistrictId } from '@/hooks';
import type { Region, District } from '@/types';
import { PROPERTY_TYPE_OPTIONS } from '@/lib';

interface PropertyFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  regions: Region[];
  districts: District[];
  isEditing?: boolean;
}

export function PropertyFormDialog({
  open,
  onClose,
  title,
  description,
  form,
  onSubmit,
  isSubmitting,
  regions,
  districts,
  isEditing = false,
}: PropertyFormDialogProps) {
  const districtId = form.watch('districtId');
  const { mahallas = [] } = useMahallasList(districtId || 'all');
  const { streets = [] } = useStreetsByDistrictId(districtId || 'all');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white dark:bg-gray-800 sm:max-w-2xl max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {description || title}
        </DialogDescription>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='gap-4 grid grid-cols-2'>
              <FormSelectField
                name='regionId'
                label='Hudud'
                options={regions}
                disabled
                placeholder='Hudud'
              />
              <FormSelectField
                name='districtId'
                label='Tuman'
                options={districts}
                disabled
                placeholder='Tuman'
              />
              <FormSelectField
                name='mahallaId'
                label='Mahalla'
                options={mahallas.map((m) => ({ id: m.code, name: m.name }))}
                placeholder='Mahalla tanlang'
              />
              <FormSelectField
                name='streetId'
                label="Ko'cha"
                options={streets.map((s) => ({ id: s.code, name: s.name }))}
                placeholder="Ko'cha tanlang"
              />
              <CadastralInput name='newCadNumber' label='Yangi kadastr' />
              <FormInputField
                name='newHouseNumber'
                label='Yangi uy raqami'
                placeholder='Uy raqami'
                autoComplete='off'
              />
              <FormSelectField
                name='type'
                label='Turi'
                placeholder='Tanlang'
                options={PROPERTY_TYPE_OPTIONS}
              />
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
