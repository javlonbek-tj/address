'use client';

import { useRef, useEffect } from 'react';
import { GeoJSON as LeafletGeoJSON } from 'leaflet';
import { MAP_LEVEL_STYLES } from '@/lib/constants/map';

interface UseMapHighlightingProps {
  selectedMahalla: string;
  selectedStreet: string;
  baseMap: string;
}

export function useMapHighlighting({
  selectedMahalla,
  selectedStreet,
  baseMap,
}: UseMapHighlightingProps) {
  const mahallaLayerRef = useRef<LeafletGeoJSON | null>(null);
  const streetLayerRef = useRef<LeafletGeoJSON | null>(null);

  useEffect(() => {
    // Update Mahalla styles
    if (mahallaLayerRef.current) {
      mahallaLayerRef.current.setStyle((feature) => {
        const id = (feature?.properties as { id: string } | undefined)?.id;
        const isSelected = id === selectedMahalla;
        return {
          ...MAP_LEVEL_STYLES.adminBoundary,
          weight: isSelected ? 4 : 2,
        };
      });
    }

    // Update Street styles
    if (streetLayerRef.current) {
      streetLayerRef.current.setStyle((feature) => {
        const id = (feature?.properties as { id: string } | undefined)?.id;
        const isSelected = id === selectedStreet;

        if (baseMap === 'satellite') {
          return isSelected
            ? MAP_LEVEL_STYLES.satellite.highlight.street
            : MAP_LEVEL_STYLES.satellite.street;
        }
        return isSelected
          ? MAP_LEVEL_STYLES.highlight.street
          : MAP_LEVEL_STYLES.street;
      });
    }
  }, [selectedMahalla, selectedStreet, baseMap]);

  return {
    mahallaLayerRef,
    streetLayerRef,
  };
}
