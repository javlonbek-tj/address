'use client';

import { Controller, useForm } from 'react-hook-form';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import type { District, Region } from '@/lib/generated/prisma/client';
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
import { updateDistrict } from '@/app/actions';
import toast from 'react-hot-toast';
import { DistrictSchemaType } from '@/lib';

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
  const [submitting, setIsSubmitting] = useState(false);
  const form = useForm<DistrictSchemaType>({
    defaultValues: district,
  });

  useEffect(() => {
    if (open) {
      form.reset(district);
    }
  }, [district, form, open]);

  const onSubmit = async (data: DistrictSchemaType) => {
    if (!district?.id) return;

    setIsSubmitting(true);
    const result = await updateDistrict(district.id, data);

    if (!result.success) {
      toast.error(result.message || 'Tumanni tahrirlashda xatolik yuz berdi');
      setIsSubmitting(false);
      return;
    }

    toast.success('Tuman muvaffaqiyatli tahrirlandi');
    onClose();
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-lg max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>
            {district ? 'Tumanni tahrirlash' : 'Tuman qoʻshish'}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          {district ? 'Tumanni tahrirlash' : 'Tuman qoʻshish'}
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="regionId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="regionId">Hudud</FieldLabel>
                  <select
                    id="regionId"
                    {...field}
                    className="flex bg-white dark:bg-gray-700 file:bg-transparent disabled:opacity-50 px-3 py-2 border border-gray-200 dark:border-gray-800 file:border-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300 ring-offset-white focus-visible:ring-offset-2 dark:ring-offset-gray-950 w-full h-10 file:font-medium dark:placeholder:text-gray-400 placeholder:text-gray-500 text-sm file:text-sm disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>
                      Hududni tanlang
                    </option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Tuman nomi</FieldLabel>
                  <Input
                    id="name"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white"
                    placeholder="Tuman nomi"
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
            isEditing={!!district}
            isPending={submitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
