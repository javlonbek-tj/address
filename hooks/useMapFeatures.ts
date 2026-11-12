'use client';

import { useMemo } from 'react';
import { Geometry } from 'geojson';
import * as turf from '@turf/turf';
import { NUMBERING_BUFFER_METERS } from '@/lib/constants/map';
import {
  MahallaWithRelations,
  StreetWithMetadata,
  Region,
  District,
  PropertyListItem,
} from '@/types';

interface Props {
  regions: Region[];
  districts: District[];
  mahallas: MahallaWithRelations[];
  streets: StreetWithMetadata[];
  properties: PropertyListItem[];
  numberingStreetId: string;
  assignments: { propertyId: string; houseNumber: string }[];
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
  numberingStreetId,
  assignments,
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

  // Semi-auto numbering: unaddressed properties within NUMBERING_BUFFER_METERS of the street.
  const numberingZone = useMemo(() => {
    const street = streets.find((s) => s.id === numberingStreetId);
    if (!street?.geometry) return null;
    try {
      return (
        turf.buffer(turf.feature(street.geometry as unknown as Geometry), NUMBERING_BUFFER_METERS, {
          units: 'meters',
        }) ?? null
      );
    } catch {
      return null;
    }
  }, [streets, numberingStreetId]);

  const nearStreetIds = useMemo(() => {
    if (!numberingZone) return new Set<string>();
    return new Set(
      properties
        .filter(
          (p) =>
            !(p.houseNumber && p.streetId) &&
            turf.booleanIntersects(turf.feature(p.geometry as Geometry), numberingZone),
        )
        .map((p) => p.id),
    );
  }, [properties, numberingZone]);

  const assignedNumbers = useMemo(
    () => new Map(assignments.map((a) => [a.propertyId, a.houseNumber])),
    [assignments],
  );

  const propertyFeatures = useMemo(() => {
    return properties.map((property) => ({
      type: 'Feature' as const,
      properties: {
        id: property.id,
        houseNumber: property.houseNumber,
        cadNumber: property.cadNumber,
        done: !!property.houseNumber && !!property.streetId,
        candidate: nearStreetIds.has(property.id) && !assignedNumbers.has(property.id),
        assignedNumber: assignedNumbers.get(property.id) ?? null,
      },
      geometry: property.geometry as Geometry,
    }));
  }, [properties, nearStreetIds, assignedNumbers]);

  const candidateCount = propertyFeatures.filter((f) => f.properties.candidate).length;

  return {
    currentMahalla,
    currentStreet,
    regionFeatures,
    districtFeatures,
    mahallaFeatures,
    streetFeatures,
    propertyFeatures,
    candidateCount,
  };
}
