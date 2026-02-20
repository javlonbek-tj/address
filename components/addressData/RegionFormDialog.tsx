'use client';

import { Controller, useForm } from 'react-hook-form';
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
} from '../ui/dialog';
import { Input } from '../ui/input';
import { DecimalInput, FormActions } from '../shared';
import { useEffect, useState } from 'react';
import { updateRegion } from '@/app/actions';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  region: Region;
}

export function RegionFormDialog({ open, onClose, region }: Props) {
  const [submitting, setIsSubmitting] = useState(false);
  const form = useForm<Region>({
    defaultValues: region,
  });
  useEffect(() => {
    if (open) {
      form.reset(region);
    }
  }, [region, form, open]);

  const onSubmit = async (data: Region) => {
    if (!region?.id) return;
    setIsSubmitting(true);
    const result = await updateRegion(region.id, data);

    if (!result.success) {
      console.log(result);
      toast.error(result.message || 'Hududni tahrirlashda xatolik yuz berdi');
      setIsSubmitting(false);
      return;
    }

    toast.success('Hudud muvaffaqiyatli tahrirlandi');
    onClose();
    setIsSubmitting(false);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-lg max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>Hududni tahrirlash</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Hududni tahrirlash
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Hudud nomi</FieldLabel>
                  <Input
                    id="name"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white"
                    placeholder="Hudud nomi"
                    autoComplete="off"
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
              name="code"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="code">Soato kodi</FieldLabel>
                  <DecimalInput
                    id="code"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white"
                    placeholder="Soato kodi"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    maxDecimals={0}
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
