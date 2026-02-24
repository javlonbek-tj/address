'use client';

import { Controller, useFieldArray } from 'react-hook-form';
import { FileUploadInput, FormActions } from '@/components/shared';
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
import { useFileUpload, useMahallaForm } from '@/hooks';
import type { District, Mahalla, Region } from '@/types';
import {
  Check,
  ChevronDown,
  FileText,
  Plus,
  Trash2,
  Upload,
  X,
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
  const regionPart = mahalla?.district?.region?.name?.split(' ') || [];
  let folderSuffix = regionPart[0] || 'default';

  if (regionPart[0] === 'Toshkent' && regionPart[1] === 'shahri') {
    folderSuffix = 'Toshkent_sh';
  }
  const {
    removeImage,
    cleanupOrphanedImage,
    markAsSubmitted,
    uploadFile,
    isUploading: isFileUploading,
  } = useFileUpload(
    mahalla?.regulationUrl,
    mahalla?.regulationUrl,
    `optimization/${folderSuffix}`,
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'mergingMahallas',
  });

  const handleAddMergedMahalla = () => {
    append({ id: '', name: '' });
  };

  const handleRemoveMergedMahalla = (index: number) => {
    remove(index);
  };

  const handleMergedMahallaIdChange = async (index: number, code: string) => {
    form.setValue(`mergingMahallas.${index}.id`, code);
    if (code) {
      const mahalla = await fetchMahallaByCode(code);
      if (mahalla) {
        form.setValue(`mergingMahallas.${index}.name`, mahalla.uzKadName);
      } else {
        form.setValue(`mergingMahallas.${index}.name`, '');
      }
    } else {
      form.setValue(`mergingMahallas.${index}.name`, '');
    }
  };

  const handleMergedMahallaNameChange = (index: number, name: string) => {
    form.setValue(`mergingMahallas.${index}.name`, name);
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
  const mergingMahallas = form.watch('mergingMahallas') || [];

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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='gap-4 grid grid-cols-2'>
            <Controller
              control={form.control}
              name='regionId'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Hudud</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled
                  >
                    <SelectTrigger className='dark:bg-gray-700 w-full dark:text-white'>
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
                    <SelectTrigger className='dark:bg-gray-700 w-full dark:text-white'>
                      <SelectValue placeholder='Tumanni tanlang' />
                    </SelectTrigger>
                    <SelectContent className='dark:bg-gray-700 dark:text-white'>
                      {districts
                        .filter(
                          (district) =>
                            district.regionId === form.watch('regionId'),
                        )
                        .map((district) => (
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
                    value={field.value ?? ''}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='Mahalla nomi'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name='uzKadName'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='uzKadName'>Uzkad Nomi</FieldLabel>
                  <Input
                    id='uzKadName'
                    {...field}
                    value={field.value ?? ''}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='Uzkad Nomi'
                    autoComplete='off'
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
                  <FieldLabel htmlFor='code'>Code</FieldLabel>
                  <Input
                    id='code'
                    {...field}
                    value={field.value ?? ''}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='Code'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name='geoCode'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='geoCode'>GeoCode</FieldLabel>
                  <Input
                    id='geoCode'
                    {...field}
                    value={field.value ?? ''}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='GeoCode'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name='oneId'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='oneId'>OneID</FieldLabel>
                  <Input
                    id='oneId'
                    {...field}
                    value={field.value ?? ''}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='OneID'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name='oldName'
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='oldName'>Eski nomi</FieldLabel>
                  <Input
                    id='oldName'
                    {...field}
                    value={field.value ?? ''}
                    className='dark:bg-gray-700 dark:text-white'
                    placeholder='Eski nomi'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className='col-span-2'>
              <Controller
                control={form.control}
                name='regulation'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='regulation'>Regulation</FieldLabel>
                    <Input
                      id='regulation'
                      {...field}
                      value={field.value ?? ''}
                      className='dark:bg-gray-700 dark:text-white'
                      placeholder='Regulation'
                      autoComplete='off'
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
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
                        if (checked && fields.length === 0) {
                          handleAddMergedMahalla();
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
                render={({ field }) => (
                  <Field>
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
                  </Field>
                )}
              />
            </div>
          )}

          {isOptimized && (
            <div className='space-y-4 border rounded-xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'>
              <div className='flex items-center justify-between p-4 border-b dark:border-gray-700'>
                <FieldLabel className='font-bold flex items-center gap-2'>
                  <Plus className='w-4 h-4 text-blue-600' />
                  Birlashtiruvchi mahallalar
                </FieldLabel>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handleAddMergedMahalla}
                  className='cursor-pointer h-8'
                >
                  + Qo'shish
                </Button>
              </div>

              <div className='p-4 space-y-4'>
                {mergingMahallas.map((mm, index) => (
                  <div
                    key={index}
                    className='grid grid-cols-[30%_60%_10%] gap-3 items-end bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm'
                  >
                    <div className='space-y-1.5'>
                      <FieldLabel
                        htmlFor={`edit-mergedIntoId-${index}`}
                        className='text-xs text-muted-foreground'
                      >
                        UzKad kodi
                      </FieldLabel>
                      <Input
                        id={`edit-mergedIntoId-${index}`}
                        value={mm.id}
                        onChange={(e) =>
                          handleMergedMahallaIdChange(index, e.target.value)
                        }
                        placeholder='UzKad kodi'
                        className='h-9 text-xs dark:bg-gray-700 dark:text-white'
                      />
                    </div>

                    <div className='space-y-1.5'>
                      <FieldLabel
                        htmlFor={`edit-mergedIntoName-${index}`}
                        className='text-xs text-muted-foreground'
                      >
                        Mahalla nomi
                      </FieldLabel>
                      <Input
                        id={`edit-mergedIntoName-${index}`}
                        value={mm.name}
                        onChange={(e) =>
                          handleMergedMahallaNameChange(index, e.target.value)
                        }
                        placeholder='Nomi'
                        className='h-9 text-xs dark:bg-gray-700 dark:text-white'
                        disabled
                      />
                    </div>

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveMergedMahalla(index)}
                      className='h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30'
                      disabled={
                        mergingMahallas.length === 1 && !mm.id && !mm.name
                      }
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <FormActions
            onCancel={() => handleClose(false)}
            isEditing={!!mahalla}
            isPending={isSubmitting}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
