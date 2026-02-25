'use client';

import { useMemo } from 'react';
import { Geometry } from 'geojson';
import * as turf from '@turf/turf';
import type {
  Region as RegionModel,
  District as DistrictModel,
} from '@/lib/generated/prisma/client';
import {
  MahallaWithRelations,
  StreetWithMetadata,
  PropertyWithRelations,
} from '@/types';

interface Props {
  regions: RegionModel[];
  districts: DistrictModel[];
  mahallas: MahallaWithRelations[];
  streets: StreetWithMetadata[];
  properties: PropertyWithRelations[];
  selectedRegion: string;
  selectedDistrict: string;
  selectedMahalla: string;
  selectedStreet: string;
}

export function useMapFeatures({
  regions,
  districts,
  mahallas,
  streets,
  properties,
  selectedRegion,
  selectedDistrict,
  selectedMahalla,
  selectedStreet,
}: Props) {
  const currentMahalla = useMemo(() => {
    return mahallas.find((mahalla) => mahalla.id === selectedMahalla);
  }, [mahallas, selectedMahalla]);

  const currentStreet = useMemo(() => {
    const street = streets.find((s) => s.id === selectedStreet);
    if (!street || !street.geometry) return street;

    try {
      const geo = street.geometry as unknown as Geometry;
      if (geo.type !== 'LineString' && geo.type !== 'MultiLineString')
        return street;

      const line =
        geo.type === 'LineString'
          ? turf.lineString(geo.coordinates)
          : turf.lineString(geo.coordinates[0]);

      const length = turf.length(line, { units: 'meters' });
      const coords = turf.getCoords(line);
      const start = coords[0];
      const end = coords[coords.length - 1];

      // Calculate bearing of the last segment for direction arrow
      let bearing = 0;
      if (coords.length >= 2) {
        const p1 = turf.point(coords[coords.length - 2]);
        const p2 = turf.point(coords[coords.length - 1]);
        bearing = turf.bearing(p1, p2);
      }

      return {
        ...street,
        metadata: {
          length,
          bearing,
          startPoint: { lat: start[1], lng: start[0] },
          endPoint: { lat: end[1], lng: end[0] },
        },
      };
    } catch (error) {
      console.error('Error calculating street metadata:', error);
      return street;
    }
  }, [streets, selectedStreet]);

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

  const propertyFeatures = useMemo(() => {
    return properties.map((property) => ({
      type: 'Feature' as const,
      properties: { id: property.id, cadNumber: property.cadNumber },
      geometry: property.geometry as unknown as Geometry,
    }));
  }, [properties]);

  return {
    currentMahalla,
    currentStreet,
    regionFeatures,
    districtFeatures,
    mahallaFeatures,
    streetFeatures,
    propertyFeatures,
  };
}
