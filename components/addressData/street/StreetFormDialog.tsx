'use client';

import { FormProvider, useFieldArray } from 'react-hook-form';
import {
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
import { FieldLabel } from '@/components/ui/field';
import { useStreetForm } from '@/hooks';
import type { Street, Region, District } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchMahallaByCode } from '@/services';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  street: Street;
  regions: Region[];
  districts: District[];
}

export function StreetFormDialog({
  open,
  onClose,
  street,
  regions,
  districts,
}: Props) {
  const [mahallaNames, setMahallaNames] = useState<Record<string, string>>({});

  const { form, isSubmitting, onSubmit } = useStreetForm({
    street,
    open,
    onClose,
    markAsSubmitted: () => {},
  });

  const displayRegions =
    street?.district?.region &&
    !regions.some((r) => r.id === street.district.region.id)
      ? [...regions, street.district.region]
      : regions;

  const displayDistricts =
    street?.district && !districts.some((d) => d.id === street.district.id)
      ? [...districts, street.district]
      : districts;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'mahallas',
  });

  const handleMahallaCodeChange = async (index: number, code: string) => {
    if (code) {
      try {
        const mahalla = await fetchMahallaByCode(code);
        if (mahalla) {
          form.setValue(`mahallas.${index}.name`, mahalla.uzKadName);
        } else {
          form.setValue(`mahallas.${index}.name`, '');
        }
      } catch (error) {
        form.setValue(`mahallas.${index}.name`, '');
      }
    } else {
      form.setValue(`mahallas.${index}.name`, '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white dark:bg-gray-800 sm:max-w-2xl max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white'>
        <DialogHeader>
          <DialogTitle>
            {street ? "Ko'chani tahrirlash" : "Ko'cha qoʻshish"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {street ? "Ko'chani tahrirlash" : "Ko'cha qoʻshish"}
        </DialogDescription>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='gap-4 grid grid-cols-2'>
              <FormSelectField
                name='regionId'
                label='Hudud'
                options={displayRegions}
                disabled
                placeholder='Hudud'
              />

              <FormSelectField
                name='districtId'
                label='Tuman'
                options={displayDistricts}
                disabled
                placeholder='Tuman'
              />

              <FormInputField
                name='name'
                label='Nomi'
                placeholder='Koʻcha nomi'
                autoComplete='off'
              />

              <FormSelectField
                name='type'
                label='Turi'
                placeholder='Tanlang'
                options={[
                  { id: "Ko'cha", name: "Ko'cha" },
                  { id: "Tor ko'cha", name: "Tor ko'cha" },
                  { id: "Berk ko'cha", name: "Berk ko'cha" },
                  { id: "Shoh ko'cha", name: "Shoh ko'cha" },
                ]}
              />

              <FormInputField
                name='code'
                label='Kodi'
                placeholder='Koʻcha kodi'
                autoComplete='off'
              />

              <FormInputField
                name='uzKadCode'
                label='UzKad kodi'
                placeholder='UzKad kodi'
                autoComplete='off'
              />
            </div>

            <div className='space-y-4 border rounded-xl overflow-hidden bg-blue-50/20 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'>
              <div className='flex items-center justify-between p-2 border-b dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/20'>
                <FieldLabel className='font-bold flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs tracking-wider uppercase'>
                  <Plus className='w-4 h-4' />
                  Mahalla bog&apos;lanishi
                </FieldLabel>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => append({ mahallaCode: '', name: '' })}
                  className='cursor-pointer h-8 bg-white dark:bg-gray-800 text-xs'
                >
                  + Qo&apos;shish
                </Button>
              </div>

              <div className='p-4 space-y-4'>
                {fields.length === 0 ? (
                  <p className='text-xs text-muted-foreground text-center py-2 italic'>
                    Bog&apos;langan mahallalar yo&apos;q
                  </p>
                ) : (
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      className='grid grid-cols-[30%_60%_10%] gap-3 items-end bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm'
                    >
                      <FormInputField
                        name={`mahallas.${index}.mahallaCode`}
                        label='Mahalla kodi'
                        placeholder='Kodi'
                        onClear={() => handleMahallaCodeChange(index, '')}
                        onChange={(e) => {
                          form.setValue(
                            `mahallas.${index}.mahallaCode`,
                            e.target.value,
                          );
                          handleMahallaCodeChange(index, e.target.value);
                        }}
                      />

                      <FormInputField
                        name={`mahallas.${index}.name`}
                        label='Mahalla nomi'
                        placeholder='Nomi'
                        hasClearBtn={false}
                        disabled
                      />

                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => remove(index)}
                        className='w-9 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 mb-2'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  ))
                )}
                {form.formState.errors.mahallas?.message && (
                  <p className='text-[10px] text-red-500 mt-1 font-medium'>
                    {form.formState.errors.mahallas.message}
                  </p>
                )}
              </div>
            </div>

            <FormActions
              onCancel={onClose}
              isEditing={!!street}
              isPending={isSubmitting}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
