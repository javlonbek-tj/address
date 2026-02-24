'use client';

import { Controller } from 'react-hook-form';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FormActions } from '@/components/shared';

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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name='regionId'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Hudud</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full dark:bg-gray-700 dark:text-white'>
                      <SelectValue placeholder='Hududni tanlang' />
                    </SelectTrigger>
                    <SelectContent className='dark:bg-gray-700 dark:text-white'>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name='name'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='name'>Tuman nomi</FieldLabel>
                  <Input
                    id='name'
                    {...field}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='Tuman nomi'
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
            isEditing={!!district}
            isPending={submitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
