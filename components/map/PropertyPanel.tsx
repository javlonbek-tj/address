'use client';

import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { FormActions, FormInputField, Spinner } from '@/components/shared';
import { RequiredSymbol } from '@/components/shared/form/RequiredSymbol';
import { assignHouseNumberAction } from '@/app/actions';
import { propertyAssignSchema, type PropertyAssignSchemaType } from '@/lib/schemas/property-schema';
import { usePropertyById } from '@/hooks/useProperties';
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

export function PropertyPanel() {
  const { selectedPropertyId, isOpen, closeSheet } = usePropertySheetStore();
  const { property, isLoadingProperty } = usePropertyById(isOpen ? selectedPropertyId : null);
  const { streets } = useStreets(property?.districtId ?? '');
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PropertyAssignSchemaType>({
    resolver: zodResolver(propertyAssignSchema),
    defaultValues: { streetId: '', houseNumber: '' },
  });

  useEffect(() => {
    if (property) {
      form.reset({ streetId: property.streetId ?? '', houseNumber: property.houseNumber ?? '' });
    }
  }, [property, form]);

  if (!isOpen || !selectedPropertyId) return null;

  const onSubmit = async (data: PropertyAssignSchemaType) => {
    if (!property) return;
    setIsSubmitting(true);
    const result = await assignHouseNumberAction(property.id, data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Uy raqami saqlandi');
      queryClient.invalidateQueries({ queryKey: ['properties', property.districtId] });
      queryClient.invalidateQueries({ queryKey: ['property', property.id] });
      closeSheet();
      return;
    }
    if (result.error === 'DUPLICATE_HOUSE_NUMBER' || result.error === 'INVALID_HOUSE_NUMBER') {
      form.setError('houseNumber', { message: result.message });
      return;
    }
    toast.error(result.message || 'Uy raqamini saqlashda xatolik yuz berdi');
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
              <FormInputField
                name='houseNumber'
                label='Uy raqami'
                requiredSymbol
                placeholder='Masalan: 1, 2A, 12/1'
                disabled={isSubmitting}
              />
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
    </div>
  );
}
