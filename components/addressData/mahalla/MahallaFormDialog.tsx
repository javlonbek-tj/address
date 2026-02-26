'use client';

import { Controller, useFieldArray, FormProvider } from 'react-hook-form';
import {
  FileUploadInput,
  FormActions,
  FormInputField,
  FormSelectField,
} from '@/components/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';

import { Checkbox } from '@/components/ui/checkbox';
import { useFileUpload, useMahallaForm } from '@/hooks';
import type { District, Mahalla, Region } from '@/types';
import {
  Check,
  ChevronDown,
  FileText,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACCEPTED_DOCUMENT_TYPES } from '@/lib';
import { useState } from 'react';
import { fetchMahallaByCode } from '@/services';

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
  const [showExistingFiles, setShowExistingFiles] = useState(false);
  const {
    removeImage,
    cleanupOrphanedImage,
    markAsSubmitted,
    uploadFile,
    isUploading: isFileUploading,
  } = useFileUpload(
    mahalla?.regulationUrl,
    mahalla?.regulationUrl,
    `optimization/${mahalla?.district?.region?.name}`,
    ACCEPTED_DOCUMENT_TYPES,
    true,
    open,
  );

  const { form, isSubmitting, onSubmit, existingFiles } = useMahallaForm({
    mahalla,
    open,
    onClose,
    markAsSubmitted,
  });

  const {
    fields: mergingFields,
    append: appendMerging,
    remove: removeMerging,
  } = useFieldArray({
    control: form.control,
    name: 'mergingMahallas',
  });

  const {
    fields: mergedIntoFields,
    append: appendMergedInto,
    remove: removeMergedInto,
  } = useFieldArray({
    control: form.control,
    name: 'mergedInto',
  });

  const handleMergingMahallaIdChange = async (index: number, code: string) => {
    if (code) {
      const mahalla = await fetchMahallaByCode(code);
      if (mahalla) {
        form.setValue(`mergingMahallas.${index}.name`, mahalla.uzKadName);
      } else {
        form.setValue(`mergingMahallas.${index}.name`, '');
      }
    }
  };

  const handleMergedIntoIdChange = async (index: number, code: string) => {
    if (code) {
      const mahalla = await fetchMahallaByCode(code);
      if (mahalla) {
        form.setValue(`mergedInto.${index}.name`, mahalla.uzKadName);
      } else {
        form.setValue(`mergedInto.${index}.name`, '');
      }
    }
  };

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
      <DialogContent className='bg-white dark:bg-gray-800 sm:max-w-2xl max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white'>
        <DialogHeader>
          <DialogTitle>
            {mahalla ? 'Mahallani tahrirlash' : 'Mahalla qoʻshish'}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {mahalla ? 'Mahallani tahrirlash' : 'Mahalla qoʻshish'}
        </DialogDescription>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='gap-4 grid grid-cols-2'>
              <FormSelectField
                name='regionId'
                label='Hudud'
                options={regions}
                disabled
                placeholder='Hududni tanlang'
              />

              <FormSelectField
                name='districtId'
                label='Tuman'
                options={districts.filter(
                  (district) => district.regionId === form.watch('regionId'),
                )}
                placeholder='Tumanni tanlang'
              />

              <FormInputField
                name='name'
                label='Mahalla nomi'
                placeholder='Mahalla nomi'
                autoComplete='off'
              />

              <FormInputField
                name='uzKadName'
                label='Uzkad Nomi'
                placeholder='Uzkad Nomi'
                autoComplete='off'
              />

              <FormInputField
                name='code'
                label='Code'
                placeholder='Code'
                autoComplete='off'
              />

              <FormInputField
                name='geoCode'
                label='GeoCode'
                placeholder='GeoCode'
                autoComplete='off'
              />

              <FormInputField
                name='oneId'
                label='OneID'
                placeholder='OneID'
                autoComplete='off'
              />

              <FormInputField
                name='oldName'
                label='Eski nomi'
                placeholder='Eski nomi'
                autoComplete='off'
              />

              <div className='col-span-2'>
                <FormInputField
                  name='regulation'
                  label='Regulation'
                  placeholder='Regulation'
                  autoComplete='off'
                />
              </div>
            </div>

            {/* Ushbu mahallaga qo'shib yuborilgan mahallalar (Manbalar) - ALWAYS VISIBLE */}
            <div className='space-y-4 border rounded-xl overflow-hidden bg-blue-50/20 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 mt-4'>
              <div className='flex items-center justify-between p-2 border-b dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/20'>
                <FieldLabel className='font-bold flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs tracking-wider'>
                  <Plus className='w-4 h-4' />
                  Ushbu mahallaga qo'shib yuborilgan mahallalar
                </FieldLabel>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => appendMerging({ mahallaCode: '', name: '' })}
                  className='cursor-pointer h-8 bg-white dark:bg-gray-800 text-xs'
                >
                  + Qo'shish
                </Button>
              </div>

              <div className='p-4 space-y-4'>
                {mergingFields.length === 0 ? (
                  <p className='text-xs text-muted-foreground text-center py-2 italic'>
                    Ushbu mahallaga hali hech qanday mahalla qo'shilmagan
                  </p>
                ) : (
                  mergingFields.map((mm, index) => (
                    <div
                      key={mm.id}
                      className='grid grid-cols-[30%_60%_10%] gap-3 items-end bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm'
                    >
                      <FormInputField
                        name={`mergingMahallas.${index}.mahallaCode`}
                        label='UzKad kodi'
                        placeholder='UzKad kodi'
                        onChange={(e) => {
                          form.setValue(
                            `mergingMahallas.${index}.mahallaCode`,
                            e.target.value,
                          );
                          handleMergingMahallaIdChange(index, e.target.value);
                        }}
                      />

                      <FormInputField
                        name={`mergingMahallas.${index}.name`}
                        label='Mahalla nomi'
                        placeholder='Nomi'
                        disabled
                      />

                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => removeMerging(index)}
                        className='w-9 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 mb-2'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className='flex items-center space-x-2 col-span-2 py-2'>
              <Controller
                control={form.control}
                name='isOptimized'
                render={({ field }) => (
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='isOptimized'
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked && mergedIntoFields.length === 0) {
                          appendMergedInto({ mahallaCode: '', name: '' });
                        }
                      }}
                    />
                    <label
                      htmlFor='isOptimized'
                      className='peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed'
                    >
                      Optimallashgan
                    </label>
                  </div>
                )}
              />
            </div>

            {isOptimized && (
              <div className='space-y-4 py-2 border-t dark:border-gray-700 mt-2'>
                <div className='flex items-center justify-between'>
                  <FieldLabel
                    htmlFor='add-regulation-file'
                    className='text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2'
                  >
                    <Upload className='w-4 h-4' />
                    Qaror (PDF yoki Rasm)
                  </FieldLabel>

                  {existingFiles.length > 0 && !form.watch('regulationUrl') && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-[10px] h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      onClick={() => setShowExistingFiles(!showExistingFiles)}
                    >
                      <FileText className='w-3 h-3 mr-1' />
                      Mavjud hujjatni tanlash
                      <ChevronDown
                        className={`w-3 h-3 ml-1 transition-transform ${showExistingFiles ? 'rotate-180' : ''}`}
                      />
                    </Button>
                  )}
                </div>

                {showExistingFiles &&
                  !form.watch('regulationUrl') &&
                  existingFiles.length > 0 && (
                    <div className='bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 space-y-2 animate-in slide-in-from-top-1 duration-200'>
                      <p className='text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2'>
                        {mahalla?.district?.region?.name} hududi uchun yuklangan
                        hujjatlar:
                      </p>
                      <div className='grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1'>
                        {existingFiles.map((file, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              form.setValue('regulationUrl', file.url);
                              form.setValue('regulation', file.name);
                              setShowExistingFiles(false);
                            }}
                            className='flex items-center justify-between p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all group'
                          >
                            <div className='flex items-center gap-2 min-w-0'>
                              <FileText className='w-3.5 h-3.5 text-blue-500 shrink-0' />
                              <span className='text-xs truncate text-gray-700 dark:text-gray-300 group-hover:text-blue-600'>
                                {file.name}
                              </span>
                            </div>
                            <Check className='w-3.5 h-3.5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity' />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <Controller
                  control={form.control}
                  name='regulationUrl'
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FileUploadInput
                        value={field.value || mahalla?.regulationUrl || ''}
                        fileName={
                          form.watch('regulationUrl') ||
                          mahalla?.regulationUrl ||
                          ''
                        }
                        isUploading={isFileUploading}
                        disabled={isFileUploading}
                        onUpload={handleUploadFile}
                        onRemove={handleRemoveImage}
                        accept='application/pdf, .pdf'
                      />
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className='text-[11px]'
                        />
                      )}
                    </Field>
                  )}
                />
              </div>
            )}

            {/* Ushbu mahalla qaysi mahallalarga qo'shilgan (Targetlar) - ONLY IF OPTIMIZED */}
            {isOptimized && (
              <div className='space-y-4 border rounded-xl overflow-hidden bg-orange-50/20 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30 mt-4'>
                <div className='flex items-center justify-between p-2 border-b dark:border-gray-700 bg-orange-50/50 dark:bg-orange-900/20'>
                  <FieldLabel className='font-bold flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300'>
                    <Plus className='w-4 h-4' />
                    Ushbu mahalla qaysi mahallalarga qo'shilgan
                  </FieldLabel>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      appendMergedInto({ mahallaCode: '', name: '' })
                    }
                    className='cursor-pointer h-8 text-xs bg-white dark:bg-gray-800'
                  >
                    + Qo'shish
                  </Button>
                </div>

                <div className='p-4 space-y-4'>
                  {mergedIntoFields.map((mm, index) => (
                    <div
                      key={mm.id}
                      className='grid grid-cols-[30%_60%_10%] gap-3 items-end bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm'
                    >
                      <FormInputField
                        name={`mergedInto.${index}.mahallaCode`}
                        label='UzKad kodi'
                        placeholder='UzKad kodi'
                        onChange={(e) => {
                          form.setValue(
                            `mergedInto.${index}.mahallaCode`,
                            e.target.value,
                          );
                          handleMergedIntoIdChange(index, e.target.value);
                        }}
                      />

                      <FormInputField
                        name={`mergedInto.${index}.name`}
                        label='Mahalla nomi'
                        placeholder='Nomi'
                        disabled
                      />

                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => removeMergedInto(index)}
                        className='h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 mb-2'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  ))}
                  {form.formState.errors.mergedInto?.message && (
                    <div className='bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-2 mt-2'>
                      <p className='text-[10px] text-red-600 dark:text-red-400 font-medium text-center'>
                        {form.formState.errors.mergedInto.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <FormActions
              onCancel={() => handleClose(false)}
              isEditing={!!mahalla}
              isPending={isSubmitting}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
