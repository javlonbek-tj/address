'use client';

import { useEffect } from 'react';
import * as turf from '@turf/turf';
import { useCreatePropertyForm } from '@/hooks/useCreatePropertyForm';
import type { Region, District } from '@/types';
import type { Geometry } from 'geojson';

import { PropertyFormDialog } from './PropertyFormDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  geometry: Geometry | null;
  regions: Region[];
  districts: District[];
}

export function CreatePropertyDialog({
  open,
  onClose,
  geometry,
  regions,
  districts,
}: Props) {
  const { form, isSubmitting, onSubmit } = useCreatePropertyForm({
    geometry,
    onClose,
  });

  useEffect(() => {
    if (open && geometry) {
      try {
        let center: number[];
        if (geometry.type === 'Point') {
          center = geometry.coordinates;
        } else {
          center = turf.coordAll(turf.centroid(geometry))[0];
        }

        const point = turf.point(center);

        const region = regions.find((r) => {
          if (!r.geometry) return false;
          return turf.booleanPointInPolygon(point, r.geometry as any);
        });

        if (region) {
          form.setValue('regionId', region.id);
          const district = districts.find((d) => {
            if (!d.geometry || d.regionId !== region.id) return false;
            return turf.booleanPointInPolygon(point, d.geometry as any);
          });

          if (district) {
            form.setValue('districtId', district.id);
          }
        }
      } catch (error) {
      }
    }
  }, [open, geometry, regions, districts, form]);

  return (
    <PropertyFormDialog
      open={open}
      onClose={onClose}
      title="Ko'chmas mulk qoʻshish"
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      regions={regions}
      districts={districts}
    />
  );
}
