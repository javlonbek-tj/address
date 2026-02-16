'use client';

import { useMemo } from 'react';
import { useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';

interface MapAutoCenterProps {
  bounds: LatLngBounds | null;
}

export function MapAutoCenter({ bounds }: MapAutoCenterProps) {
  const map = useMap();
  useMemo(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], animate: true });
    } else {
      // Default view if no bounds
      map.setView([41.377, 64.585], 6);
    }
  }, [bounds, map]);
  return null;
}
