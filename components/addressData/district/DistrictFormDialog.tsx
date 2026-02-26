'use client';

import { FormProvider } from 'react-hook-form';
import { FieldGroup } from '@/components/ui/field';
import type { District, Region } from '@/types';
import { useDistrictForm } from '@/hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FormActions,
  FormInputField,
  FormSelectField,
} from '@/components/shared';

interface Props {
  open: boolean;
  onClose: () => void;
  district: District;
  regions: Region[];
}

export function DistrictFormDialog({
  open,
  onClose,
  district,
  regions,
}: Props) {
  const { form, submitting, onSubmit } = useDistrictForm({
    district,
    open,
    onClose,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white dark:bg-gray-800 sm:max-w-lg max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white'>
        <DialogHeader>
          <DialogTitle>Tumanni tahrirlash</DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          Tumanni tahrirlash
        </DialogDescription>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FormSelectField
                name='regionId'
                label='Hudud'
                options={regions}
                placeholder='Hududni tanlang'
              />

              <FormInputField
                label='Tuman nomi'
                name='name'
                autoComplete='off'
              />

              <FormInputField
                label='Soato kodi'
                name='code'
                autoComplete='off'
                inputMode='numeric'
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  form.setValue('code', value);
                }}
              />
            </FieldGroup>
            <FormActions
              onCancel={onClose}
              isEditing={!!district}
              isPending={submitting}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
