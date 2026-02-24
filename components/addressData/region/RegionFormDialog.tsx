'use client';

import { Controller } from 'react-hook-form';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import type { Region } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FormActions } from '@/components/shared';

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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name='name'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='name'>Hudud nomi</FieldLabel>
                  <Input
                    id='name'
                    {...field}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='Hudud nomi'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name='code'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='code'>Soato kodi</FieldLabel>
                  <Input
                    id='code'
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='Soato kodi'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                    inputMode='numeric'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <FormActions
            onCancel={onClose}
            isEditing={true}
            isPending={submitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
