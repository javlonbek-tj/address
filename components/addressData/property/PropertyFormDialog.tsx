'use client';

import { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import * as turf from '@turf/turf';
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
import {
  usePropertyForm,
  useMahallasList,
  useStreetsByDistrictId,
} from '@/hooks';
import type { Property, PropertyForForm, Region, District } from '@/types';
import { CadastralInput } from '@/components/shared';

interface Props {
  open: boolean;
  onClose: () => void;
  property: Property | PropertyForForm | null;
  geometry?: any | null;
  regions: Region[];
  districts: District[];
}

export function PropertyFormDialog({
  open,
  onClose,
  property,
  geometry,
  regions,
  districts,
}: Props) {
  const { form, isSubmitting, onSubmit } = usePropertyForm({
    property,
    geometry,
    open,
    onClose,
    markAsSubmitted: () => {},
  });

  // Automatic region and district detection when drawing
  useEffect(() => {
    if (open && geometry && !property?.id) {
      try {
        let center: number[];

        if (geometry.type === 'Point') {
          center = geometry.coordinates;
        } else {
          center = turf.coordAll(turf.centroid(geometry))[0];
        }

        const point = turf.point(center);

        // Find region
        const region = regions.find((r: any) => {
          if (!r.geometry) return false;
          return turf.booleanPointInPolygon(point, r.geometry as any);
        });

        if (region) {
          form.setValue('regionId', region.id);
          // Find district
          const district = districts.find((d: any) => {
            if (!d.geometry || d.regionId !== (region as any).id) return false;
            return turf.booleanPointInPolygon(point, d.geometry as any);
          });

          if (district) {
            form.setValue('districtId', district.id);
          }
        }
      } catch (error) {
        console.error('Error auto-detecting location:', error);
      }
    }
  }, [open, geometry, property, regions, districts, form]);

  const propertyDistrictId = form.watch('districtId') || property?.district?.id;

  const { mahallas = [] } = useMahallasList(propertyDistrictId || 'all');
  const { streets = [] } = useStreetsByDistrictId(propertyDistrictId || 'all');

  const displayRegions =
    property?.district?.region &&
    !regions.some((r) => r.id === property.district.region.id)
      ? [...regions, property.district.region]
      : regions;

  const displayDistricts =
    property?.district && !districts.some((d) => d.id === property.district.id)
      ? [...districts, property.district]
      : districts;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-white dark:bg-gray-800 sm:max-w-2xl max-h-[90vh] overflow-x-hidden overflow-y-auto text-gray-900 dark:text-white'>
        <DialogHeader>
          <DialogTitle>
            {property ? "Ko'chmas mulkni tahrirlash" : "Ko'chmas mulk qoʻshish"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='sr-only'>
          {property ? "Ko'chmas mulkni tahrirlash" : "Ko'chmas mulk qoʻshish"}
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

              <FormSelectField
                name='mahallaId'
                label='Mahalla'
                options={mahallas.map((m) => ({ id: m.code, name: m.name }))}
                placeholder='Mahalla tanlang'
              />

              <FormSelectField
                name='streetId'
                label="Ko'cha"
                options={
                  streets.map((s) => ({ id: s.code, name: s.name })) as any
                }
                placeholder="Ko'cha tanlang"
              />

              <CadastralInput name='newCadNumber' label='Yangi kadastr' />

              <FormInputField
                name='newHouseNumber'
                label='Yangi uy raqami'
                placeholder='Uy raqami'
                autoComplete='off'
              />

              <FormSelectField
                name='type'
                label='Turi'
                placeholder='Tanlang'
                options={[
                  { id: 'residential', name: 'Turar' },
                  { id: 'non-residential', name: 'Noturar' },
                ]}
              />
            </div>

            <FormActions
              onCancel={onClose}
              isEditing={!!property}
              isPending={isSubmitting}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
