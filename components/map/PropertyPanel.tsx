'use client';

import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { DeleteDialog, FormActions, FormInputField, Spinner } from '@/components/shared';
import { RequiredSymbol } from '@/components/shared/form/RequiredSymbol';
import { assignHouseNumberAction, releaseReservedNumberAction } from '@/app/actions';
import { propertyAssignSchema, type PropertyAssignSchemaType } from '@/lib/schemas/property-schema';
import { usePropertyById, useStreetNumbers } from '@/hooks/useProperties';
import { useStreets } from '@/hooks/useStreets';
import { usePropertySheetStore } from '@/store/usePropertySheetStore';
import { StreetSearchSelect } from './StreetSearchSelect';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='grid grid-cols-3 gap-2 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='col-span-2 break-words'>{value}</span>
    </div>
  );
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export function PropertyPanel() {
  const { selectedPropertyId, isOpen, closeSheet } = usePropertySheetStore();
  const { property, isLoadingProperty } = usePropertyById(isOpen ? selectedPropertyId : null);
  const { streets } = useStreets(property?.districtId ?? '');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // A reserved number may only be used when picked from the list for this property and street.
  const [picked, setPicked] = useState<{ propertyId: string; streetId: string; houseNumber: string } | null>(null);
  const [releaseTarget, setReleaseTarget] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  const form = useForm<PropertyAssignSchemaType>({
    resolver: zodResolver(propertyAssignSchema),
    defaultValues: { streetId: '', houseNumber: '' },
  });
  const selectedStreetId = useWatch({ control: form.control, name: 'streetId' });
  const { streetNumbers } = useStreetNumbers(selectedStreetId);

  useEffect(() => {
    if (property) {
      form.reset({ streetId: property.streetId ?? '', houseNumber: property.houseNumber ?? '' });
    }
  }, [property, form]);

  if (!isOpen || !selectedPropertyId) return null;

  const onSubmit = async (data: PropertyAssignSchemaType) => {
    if (!property) return;
    const useReserved =
      picked?.propertyId === property.id &&
      picked.streetId === data.streetId &&
      picked.houseNumber === data.houseNumber;
    setIsSubmitting(true);
    const result = await assignHouseNumberAction(property.id, data, useReserved);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Uy raqami saqlandi');
      queryClient.invalidateQueries({ queryKey: ['properties', property.districtId] });
      queryClient.invalidateQueries({ queryKey: ['property', property.id] });
      queryClient.invalidateQueries({ queryKey: ['street-numbers'] });
      closeSheet();
      return;
    }
    if (
      result.error === 'DUPLICATE_HOUSE_NUMBER' ||
      result.error === 'INVALID_HOUSE_NUMBER' ||
      result.error === 'RESERVED_HOUSE_NUMBER'
    ) {
      form.setError('houseNumber', { message: result.message });
      return;
    }
    toast.error(result.message || 'Uy raqamini saqlashda xatolik yuz berdi');
  };

  // 15 → 15a (or the first free letter on this street).
  const addLetter = () => {
    const base = form.getValues('houseNumber').trim().match(/^[1-9]\d*/)?.[0];
    if (!base) {
      form.setError('houseNumber', { message: 'Avval asosiy raqamni kiriting (masalan: 15)' });
      return;
    }
    const taken = new Set([...streetNumbers.used, ...streetNumbers.reserved]);
    const letter = [...LETTERS].find((l) => !taken.has(`${base}${l}`));
    if (!letter) {
      form.setError('houseNumber', { message: `${base} uchun bo'sh harf qolmadi (a–z)` });
      return;
    }
    form.setValue('houseNumber', `${base}${letter}`, { shouldValidate: true });
  };

  const pickReserved = (houseNumber: string) => {
    if (!property) return;
    form.setValue('houseNumber', houseNumber, { shouldValidate: true });
    setPicked({ propertyId: property.id, streetId: selectedStreetId, houseNumber });
  };

  const releaseReserved = async () => {
    if (!releaseTarget) return;
    setIsReleasing(true);
    const result = await releaseReservedNumberAction(selectedStreetId, releaseTarget);
    setIsReleasing(false);
    setReleaseTarget(null);
    if (result.success) {
      toast.success('Zaxira bekor qilindi');
      queryClient.invalidateQueries({ queryKey: ['street-numbers', selectedStreetId] });
    } else {
      toast.error(result.message || 'Zaxirani bekor qilishda xatolik yuz berdi');
    }
  };

  const currentStreet = property?.street ? `${property.street.name} ${property.street.type}` : '—';

  return (
    <div className='absolute top-3 right-3 z-(--z-map-ui) w-80 max-h-[calc(50%-6rem)] overflow-y-auto rounded-xl border bg-background/95 shadow-xl backdrop-blur-md'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <h3 className='font-semibold'>Uy raqami berish</h3>
        <button
          type='button'
          onClick={closeSheet}
          className='rounded-md p-1 hover:bg-muted cursor-pointer'
          aria-label='Yopish'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      {isLoadingProperty || !property ? (
        <div className='flex justify-center p-6'>
          <Spinner size='sm' showOverlay={false} />
        </div>
      ) : (
        <div className='flex flex-col gap-4 p-4'>
          <div className='flex flex-col gap-1.5'>
            <InfoRow label='Kadastr raqami' value={property.cadNumber ?? '—'} />
            <InfoRow label='Mahalla' value={property.mahalla?.name ?? '—'} />
            <InfoRow label="Joriy ko'cha" value={currentStreet} />
            <InfoRow label='Manzil' value={property.newAddress ?? 'Manzil berilmagan'} />
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3'>
              <Controller
                control={form.control}
                name='streetId'
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Ko&apos;cha
                      <RequiredSymbol />
                    </FieldLabel>
                    <StreetSearchSelect
                      streets={streets}
                      value={field.value}
                      onChange={field.onChange}
                      invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className='text-xs' />}
                  </Field>
                )}
              />
              <div className='flex items-end gap-2'>
                <FormInputField
                  name='houseNumber'
                  label='Uy raqami'
                  requiredSymbol
                  placeholder='Masalan: 1, 2a, 12/1'
                  disabled={isSubmitting}
                  className='flex-1'
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={addLetter}
                  disabled={isSubmitting || !selectedStreetId}
                  className='h-10 cursor-pointer'
                  title="Keyingi bo'sh harfni qo'shish (15 → 15a)"
                >
                  + harf
                </Button>
              </div>

              {streetNumbers.reserved.length > 0 && (
                <div className='flex flex-col gap-1.5 text-sm'>
                  <span className='text-muted-foreground'>Zaxiradagi raqamlar (tanlash uchun bosing):</span>
                  <div className='flex flex-wrap gap-1'>
                    {streetNumbers.reserved.map((n) => (
                      <span
                        key={n}
                        className='inline-flex items-center rounded bg-gray-200 text-xs font-medium text-gray-700'
                      >
                        <button
                          type='button'
                          onClick={() => pickReserved(n)}
                          disabled={isSubmitting}
                          className='px-1.5 py-0.5 hover:bg-gray-300 rounded-l cursor-pointer'
                        >
                          {n}
                        </button>
                        <button
                          type='button'
                          onClick={() => setReleaseTarget(n)}
                          disabled={isSubmitting}
                          className='px-1 py-0.5 hover:bg-red-200 rounded-r cursor-pointer'
                          aria-label={`${n} zaxirasini bekor qilish`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <FormActions
                isPending={isSubmitting}
                onCancel={closeSheet}
                submitText='Saqlash'
                className='pt-1'
              />
            </form>
          </FormProvider>
        </div>
      )}

      <DeleteDialog
        open={!!releaseTarget}
        onClose={() => setReleaseTarget(null)}
        onConfirm={releaseReserved}
        title='Zaxirani bekor qilish'
        description={`${releaseTarget ?? ''} raqami zaxiradan chiqariladi va boshqa binoga berilishi mumkin bo'ladi.`}
        isDeleting={isReleasing}
      />
    </div>
  );
}
