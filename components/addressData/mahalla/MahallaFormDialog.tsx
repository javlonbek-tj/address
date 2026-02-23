'use client';

import { Controller, useFieldArray } from 'react-hook-form';
import { FormActions } from '@/components/shared';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useImageUpload, useMahallaForm } from '@/hooks';
import type { District, Mahalla, Region } from '@/types';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const { form, isSubmitting, onSubmit, fetchMahallaByCode } = useMahallaForm({
    mahalla,
    open,
    onClose,
    markAsSubmitted,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'mergingMahallas',
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

  const isOptimized = form.watch('isOptimized');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-2xl max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>
            {mahalla ? 'Mahallani tahrirlash' : 'Mahalla qoʻshish'}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          {mahalla ? 'Mahallani tahrirlash' : 'Mahalla qoʻshish'}
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="gap-4 grid grid-cols-2">
            <Controller
              control={form.control}
              name="regionId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Hudud</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled
                  >
                    <SelectTrigger className="dark:bg-gray-700 w-full dark:text-white">
                      <SelectValue placeholder="Hududni tanlang" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-white">
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
              name="districtId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tuman</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="dark:bg-gray-700 w-full dark:text-white">
                      <SelectValue placeholder="Tumanni tanlang" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-white">
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
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required htmlFor="name">
                    Mahalla nomi
                  </FieldLabel>
                  <Input
                    id="name"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white"
                    placeholder="Mahalla nomi"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="uzKadName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required htmlFor="uzKadName">
                    Uzkad Nomi
                  </FieldLabel>
                  <Input
                    id="uzKadName"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white"
                    placeholder="Uzkad Nomi"
                    autoComplete="off"
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
                  <FieldLabel required htmlFor="code">
                    Code
                  </FieldLabel>
                  <Input
                    id="code"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white"
                    placeholder="Code"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="geoCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required htmlFor="geoCode">
                    GeoCode
                  </FieldLabel>
                  <Input
                    id="geoCode"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white"
                    placeholder="GeoCode"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="oneId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required htmlFor="oneId">
                    OneID
                  </FieldLabel>
                  <Input
                    id="oneId"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white"
                    placeholder="OneID"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="oldName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="oldName">Eski nomi</FieldLabel>
                  <Input
                    id="oldName"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white"
                    placeholder="Eski nomi"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="col-span-2">
              <Controller
                control={form.control}
                name="regulation"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="regulation">Regulation</FieldLabel>
                    <Input
                      id="regulation"
                      {...field}
                      className="dark:bg-gray-700 dark:text-white"
                      placeholder="Regulation"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="flex items-center space-x-2 col-span-2 py-2">
              <Controller
                control={form.control}
                name="isOptimized"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isOptimized"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="isOptimized"
                      className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                    >
                      Optimallashgan
                    </label>
                  </div>
                )}
              />
            </div>
          </div>

          {isOptimized && (
            <div className="space-y-4 bg-blue-50/30 dark:bg-blue-900/10 mt-4 p-4 border border-blue-200 dark:border-blue-900 rounded-lg">
              <Controller
                control={form.control}
                name="hidden"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hidden"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="hidden"
                      className="font-medium text-sm leading-none"
                    >
                      Yashirilgan
                    </label>
                  </div>
                )}
              />

              <Field>
                <FieldLabel htmlFor="regulationUrl">
                  Qaror (PDF yoki Rasm)
                </FieldLabel>
                <div className="group relative flex flex-col justify-center items-center bg-white dark:bg-gray-700 mt-1 p-6 border-2 border-gray-300 hover:border-blue-400 dark:border-gray-600 border-dashed rounded-lg transition-colors cursor-pointer">
                  {previewUrl ? (
                    <div className="relative w-full aspect-video">
                      <iframe
                        src={previewUrl}
                        className="rounded w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="-top-2 -right-2 z-10 absolute bg-red-500 hover:bg-red-600 p-1 rounded-full text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col justify-center items-center w-full h-full cursor-pointer">
                      <div className="bg-blue-100 dark:bg-blue-900/30 mb-3 p-3 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                        {isImageUploading
                          ? 'Yuklanmoqda...'
                          : 'Faylni yuklash uchun bosing yoki sudrab keling'}
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="application/pdf,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadFile(file);
                        }}
                      />
                    </label>
                  )}
                </div>
              </Field>

              <div className="space-y-4 pt-4 border-blue-200 dark:border-blue-900 border-t">
                <div className="flex justify-between items-center">
                  <h4 className="flex items-center gap-2 font-semibold text-sm">
                    <Plus size={16} className="text-blue-500" /> Birlashtiruvchi
                    mahallalar
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ id: '', name: '' })}
                    className="px-2 py-0 h-8 text-xs"
                  >
                    + Qo'shish
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-3">
                      <div className="w-32">
                        <FieldLabel className="mb-1 text-[10px] uppercase tracking-wider">
                          ID / Kod
                        </FieldLabel>
                        <Controller
                          control={form.control}
                          name={`mergingMahallas.${index}.id`}
                          render={({ field: inputField }) => (
                            <Input
                              {...inputField}
                              className="h-9 text-xs"
                              placeholder="ID"
                              onChange={async (e) => {
                                const val = e.target.value;
                                inputField.onChange(val);
                                if (val.length >= 3) {
                                  const result = await fetchMahallaByCode(val);
                                  if (result) {
                                    form.setValue(
                                      `mergingMahallas.${index}.name`,
                                      result.name,
                                    );
                                  } else {
                                    form.setValue(
                                      `mergingMahallas.${index}.name`,
                                      '',
                                    );
                                  }
                                } else {
                                  form.setValue(
                                    `mergingMahallas.${index}.name`,
                                    '',
                                  );
                                }
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <FieldLabel className="mb-1 text-[10px] uppercase tracking-wider">
                          Mahalla nomi
                        </FieldLabel>
                        <Controller
                          control={form.control}
                          name={`mergingMahallas.${index}.name`}
                          render={({ field: inputField }) => (
                            <Input
                              {...inputField}
                              className="bg-gray-50/50 dark:bg-gray-800/50 h-9 text-xs"
                              placeholder="Nomi"
                              readOnly
                            />
                          )}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="mb-1.5 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
