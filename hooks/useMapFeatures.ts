'use client';

import { useMemo } from 'react';
import { Geometry } from 'geojson';
import type { Region } from '@/lib/generated/prisma/client';
import type { District, Mahalla, Street } from '@/types';

interface UseMapFeaturesProps {
  regions: Region[];
  districts: District[];
  mahallas: Mahalla[];
  streets: Street[];
  selectedRegion: string;
  selectedDistrict: string;
  selectedMahalla: string;
}

export function useMapFeatures({
  regions,
  districts,
  mahallas,
  streets,
  selectedRegion,
  selectedDistrict,
  selectedMahalla,
}: UseMapFeaturesProps) {
  const currentMahalla = useMemo(() => {
    return mahallas.find((mahalla) => mahalla.id === selectedMahalla);
  }, [mahallas, selectedMahalla]);

  const regionFeatures = useMemo(() => {
    const items = selectedRegion
      ? regions.filter((region) => region.id === selectedRegion)
      : regions;
    return items.map((region) => ({
      type: 'Feature' as const,
      properties: { id: region.id, name: region.name, code: region.code },
      geometry: region.geometry as unknown as Geometry,
    }));
  }, [regions, selectedRegion]);

  const districtFeatures = useMemo(() => {
    const items = selectedDistrict
      ? districts.filter((district) => district.id === selectedDistrict)
      : districts;
    return items.map((district) => ({
      type: 'Feature' as const,
      properties: { id: district.id, name: district.name, code: district.code },
      geometry: district.geometry as unknown as Geometry,
    }));
  }, [districts, selectedDistrict]);

  const mahallaFeatures = useMemo(() => {
    return mahallas.map((mahalla) => ({
      type: 'Feature' as const,
      properties: { id: mahalla.id, name: mahalla.name },
      geometry: mahalla.geometry as unknown as Geometry,
    }));
  }, [mahallas]);

  const streetFeatures = useMemo(() => {
    return streets.map((street) => ({
      type: 'Feature' as const,
      properties: { id: street.id, name: street.name, type: street.type },
      geometry: street.geometry as unknown as Geometry,
    }));
  }, [streets]);

  return {
    currentMahalla,
    regionFeatures,
    districtFeatures,
    mahallaFeatures,
    streetFeatures,
  };
}
