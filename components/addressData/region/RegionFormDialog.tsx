'use client';

import { FormProvider } from 'react-hook-form';
import { FieldGroup } from '@/components/ui/field';
import type { Region } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormActions, FormInputField } from '@/components/shared';

import { useRegionForm } from '@/hooks';

interface Props {
  open: boolean;
  onClose: () => void;
  region: Region;
}

export function RegionFormDialog({ open, onClose, region }: Props) {
  const { form, submitting, onSubmit } = useRegionForm({
    region,
    open,
    onClose,
  });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white dark:bg-gray-800 sm:max-w-lg max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white'>
        <DialogHeader>
          <DialogTitle>Hududni tahrirlash</DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          Hududni tahrirlash
        </DialogDescription>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FormInputField
                label='Hudud nomi'
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
              isEditing={true}
              isPending={submitting}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
