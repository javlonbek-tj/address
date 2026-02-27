'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { usePropertyForm } from '@/hooks';
import { FormProvider } from 'react-hook-form';
import {
  FormActions,
  FormSelectField,
  FormInputField,
  Spinner,
} from '@/components/shared';
import { cn } from '@/lib/utils';
import { CadastralInput } from './CadastralInput';
import { useStreetsByDistrictId } from '@/hooks/useStreets';
import { useProperty } from '@/hooks/useProperties';
import { usePropertySheetStore } from '@/store/usePropertySheetStore';
import { useMapFilterStore } from '@/store/useMapFilterStore';

export function PropertyDetailsSheet() {
  const { selectedPropertyId, close } = usePropertySheetStore();
  const { selectedDistrict } = useMapFilterStore();
  const isOpen = !!selectedPropertyId;

  const { property, isLoadingProperty } = useProperty(selectedPropertyId || '');
  const { form, isSubmitting, onSubmit } = usePropertyForm({
    property,
    open: isOpen,
    onClose: close,
  });

  const { streets, isLoadingStreets } =
    useStreetsByDistrictId(selectedDistrict);

  if (isLoadingProperty) {
    return <Spinner size='sm' />;
  }
  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent
        className={cn(
          'flex flex-col p-0 z-(--z-sheet) w-full sm:max-w-md',
          'bg-gray-50 dark:bg-[#0f1117]',
          'border-l border-gray-200 dark:border-gray-800',
        )}
      >
        {/* Header */}
        <div className='relative overflow-hidden shrink-0'>
          {/* Decorative gradient bar */}
          <div className='absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500' />

          <SheetHeader className='px-6 pt-10 pb-5'>
            <SheetDescription className='sr-only'>
              Ko&apos;chmas mulk ma&apos;lumotlarini tahrirlash
            </SheetDescription>

            <div className='flex items-start justify-between gap-4'>
              <SheetTitle className='text-base font-bold text-gray-900 dark:text-white'>
                Ko&apos;chmas mulk
              </SheetTitle>

              {/* Status badge */}
              <span className='shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                Tahrirlash
              </span>
            </div>
          </SheetHeader>

          {/* Divider */}
          <div className='h-px bg-linear-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-6' />
        </div>

        {/* Scrollable form body */}
        <div className='flex-1 overflow-y-auto relative min-h-60'>
          {property ? (
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='px-6 py-5 space-y-6'
              >
                {/* Cadastral Number */}
                <CadastralInput name='newCadNumber' label='Kadastr raqami' />
                <FormInputField
                  name='newHouseNumber'
                  label='Uy raqami'
                  placeholder='Uy raqamini kiriting'
                />

                {/* Divider */}
                <div className='h-px bg-gray-200 dark:bg-gray-800' />

                {/* Building Type */}
                <FormSelectField
                  name='type'
                  label='Bino turi'
                  placeholder="Ko'chmas mulk turini tanlang"
                  options={[
                    {
                      id: 'residential',
                      name: 'Turar joy',
                    },
                    {
                      id: 'non-residential',
                      name: 'Noturar joy',
                    },
                  ]}
                />

                {/* Divider */}
                <div className='h-px bg-gray-200 dark:bg-gray-800' />

                {/* Street */}
                <FormSelectField
                  name='streetId'
                  label="Ko'cha"
                  placeholder={
                    isLoadingStreets ? 'Yuklanmoqda...' : "Ko'chani tanlang"
                  }
                  disabled={isLoadingStreets}
                  options={streets.map((street) => ({
                    id: street.code,
                    name: street.name,
                  }))}
                />

                {/* Footer — pinned to bottom */}
                <FormActions
                  onCancel={close}
                  isEditing={true}
                  isPending={isSubmitting}
                  editText='Saqlash'
                />
              </form>
            </FormProvider>
          ) : (
            <div className='flex items-center justify-center p-12 text-center'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Obyekt ma&apos;lumotlarini yuklashda xatolik yuz berdi.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
