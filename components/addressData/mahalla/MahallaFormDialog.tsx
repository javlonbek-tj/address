'use client';

import { Controller } from 'react-hook-form';
import { DecimalInput, FormActions } from '@/components/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useImageUpload, useMahallaForm } from '@/hooks';
import type { District, Mahalla, Region } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  mahalla: Mahalla;
  regions: Region[];
  districts: District[];
}

export function MahallaFormDialog({
  open,
  onClose,
  mahalla,
  regions,
  districts,
}: Props) {
  const {
    previewUrl,
    removeImage,
    cleanupOrphanedImage,
    markAsSubmitted,
    uploadFile,
    isUploading: isImageUploading,
  } = useImageUpload(
    mahalla?.regulationUrl,
    open,
    mahalla?.district?.region?.name,
    mahalla?.regulationUrl,
  );

  const { form, isSubmitting, onSubmit } = useMahallaForm({
    mahalla,
    open,
    onClose,
    markAsSubmitted,
  });

  const handleClose = async (isOpen: boolean) => {
    if (!isOpen) {
      await cleanupOrphanedImage();
    }
    onClose();
  };

  const handleRemoveImage = async () => {
    await removeImage();
    form.setValue('regulationUrl', '', { shouldValidate: true });
  };

  const handleUploadFile = async (file: File) => {
    const res = await uploadFile(file);
    if (!res.success) {
      form.setError('regulationUrl', {
        type: 'manual',
        message: res.message,
      });
      return;
    }
    form.clearErrors('regulationUrl');
    form.setValue('regulationUrl', res.data?.imageUrl || '', {
      shouldValidate: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='bg-white dark:bg-gray-800 sm:max-w-lg max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white'>
        <DialogHeader>
          <DialogTitle>
            {mahalla ? 'Mahallani tahrirlash' : 'Mahalla qoʻshish'}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {mahalla ? 'Mahallani tahrirlash' : 'Mahalla qoʻshish'}
        </DialogDescription>
        <form>
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
              name='districtId'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tuman</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full dark:bg-gray-700 dark:text-white'>
                      <SelectValue placeholder='Tumanni tanlang' />
                    </SelectTrigger>
                    <SelectContent className='dark:bg-gray-700 dark:text-white'>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
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
                  <FieldLabel htmlFor='name'>Mahalla nomi</FieldLabel>
                  <Input
                    id='name'
                    {...field}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='Mahalla nomi'
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
                  <DecimalInput
                    id='code'
                    {...field}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='Soato kodi'
                    autoComplete='off'
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
            isEditing={!!mahalla}
            isPending={isSubmitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
