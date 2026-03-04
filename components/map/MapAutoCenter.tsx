'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';

interface MapAutoCenterProps {
  bounds: LatLngBounds | null;
}

export function MapAutoCenter({ bounds }: MapAutoCenterProps) {
  const map = useMap();

  useEffect(() => {
    if (!bounds) {
      map.setView([41.377, 64.585], 6);
      return;
    }

    const timer = setTimeout(() => {
      map.invalidateSize({ animate: false });
      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: false,
        maxZoom: 12,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [bounds, map]);

  return null;
}
