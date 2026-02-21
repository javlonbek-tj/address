'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useSidebar } from '@/components/ui/sidebar';

export function MapResizeHandler() {
  const map = useMap();
  const { state } = useSidebar();

  useEffect(() => {
    // Leaflet needs to be notified when its container changes size.
    // We wait for the sidebar transition to complete before invalidating size.
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250); // Matches transition duration + small buffer

    return () => clearTimeout(timer);
  }, [state, map]);

  return null;
}
